import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';
import { Queue } from 'bullmq';
import { QueueNames } from '@dbsnap/shared';

@Injectable()
export class SnapshotsService {
    constructor(
        private readonly prisma: PrismaService,
        @Inject(QueueNames.BACKUP) private readonly backupQueue: Queue,
    ) { }

    async findAll(userId: string, projectId: string) {
        // Enforce ownership: Check if project exists and user is in its organization
        const project = await this.prisma.project.findFirst({
            where: {
                id: projectId,
                organization: {
                    users: { some: { id: userId } }
                }
            }
        });

        if (!project) {
            throw new NotFoundException('Project not found or access denied');
        }

        return this.prisma.backupSnapshot.findMany({
            where: {
                connection: {
                    projectId: projectId
                }
            },
            include: {
                connection: {
                    select: {
                        name: true,
                        type: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async findOne(userId: string, id: string) {
        const snapshot = await this.prisma.backupSnapshot.findFirst({
            where: {
                id,
                connection: {
                    project: {
                        organization: {
                            users: { some: { id: userId } }
                        }
                    }
                }
            },
            include: {
                connection: {
                    select: {
                        name: true,
                        type: true
                    }
                }
            }
        });

        if (!snapshot) {
            throw new NotFoundException('Snapshot not found or access denied');
        }

        return snapshot;
    }

    async trigger(userId: string, projectId: string) {
        const project = await this.prisma.project.findFirst({
            where: {
                id: projectId,
                organization: {
                    users: { some: { id: userId } }
                }
            },
            include: {
                connections: { take: 1 } // Get the primary connection
            }
        });

        if (!project) {
            throw new NotFoundException('Project not found or access denied');
        }

        const connection = project.connections[0];
        if (!connection) {
            throw new ForbiddenException('Project has no database connections. Add a connection first.');
        }

        // Push job to BullMQ
        const job = await this.backupQueue.add('snapshot-trigger', {
            projectId: project.id,
            organizationId: project.organizationId,
            connectionId: connection.id,
            databaseType: connection.type,
            // connectionDetails are intentionally omitted here to keep payload small.
            // The worker will fetch the connection details from the DB using connectionId.
        }, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 1000 }
        });

        return {
            jobId: job.id,
            status: 'queued',
            message: 'Snapshot creation job has been queued.'
        };
    }
}
