import { Injectable, Logger, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../database/prisma.service.js';
import { SnapshotStatus } from '@dbsnap/database';
@Injectable()
export class BackupsService {
    private readonly logger = new Logger(BackupsService.name);

    constructor(
        @Inject(PrismaService) private prisma: PrismaService
    ) {
        console.log('BackupsService initialized, prisma:', !!this.prisma);
    }

    @Cron(CronExpression.EVERY_MINUTE)
    async handleCron() {
        this.logger.debug('Checking for due backup schedules...');

        // Find active schedules
        const schedules = await this.prisma.backupSchedule.findMany({
            where: { isActive: true },
            include: { connection: true },
        });

        for (const schedule of schedules) {
            // In a real implementation, we would check if the cron expression matches the current time
            // For now, we simulate triggering a backup for each active schedule
            // (The @Cron decorator here is just for the system-wide check, not per-schedule yet)
            this.logger.log(`Triggering backup for schedule: ${schedule.name} (${schedule.id})`);
            await this.triggerBackup(schedule.id);
        }
    }

    async triggerBackup(scheduleId: string) {
        const schedule = await this.prisma.backupSchedule.findUnique({
            where: { id: scheduleId },
            include: { connection: true },
        });

        if (!schedule) {
            throw new Error(`Schedule with ID ${scheduleId} not found`);
        }

        // Create a pending snapshot
        const snapshot = await this.prisma.backupSnapshot.create({
            data: {
                status: SnapshotStatus.PENDING,
                scheduleId: schedule.id,
                connectionId: schedule.connectionId,
            },
        });

        this.logger.log(`Created pending snapshot ${snapshot.id} for schedule ${schedule.name}`);

        // TODO: Dispatch job to worker queue (PHASE 5)
        // For now, we'll simulate a worker picking it up and finishing it in the worker app

        // After triggering, we also check if retention cleanup is needed
        await this.runRetentionCleanup(scheduleId);

        return snapshot;
    }



    async findAllSnapshots(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { organizationId: true },
        });

        if (!user || !user.organizationId) {
            return [];
        }

        return this.prisma.backupSnapshot.findMany({
            where: {
                connection: {
                    project: {
                        organizationId: user.organizationId
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
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

    async createManualSnapshot(userId: string, connectionId: string) {
        // Validate access
        const connection = await this.prisma.databaseConnection.findUnique({
            where: { id: connectionId },
            include: { project: true }
        });

        if (!connection) {
            throw new Error('Connection not found');
        }

        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { organizationId: true }
        });

        if (!user || user.organizationId !== connection.project.organizationId) {
            throw new Error('Unauthorized access to connection');
        }

        // Create pending snapshot
        const snapshot = await this.prisma.backupSnapshot.create({
            data: {
                status: SnapshotStatus.PENDING,
                connectionId: connection.id,
                // No scheduleId for manual snapshots
            }
        });

        this.logger.log(`Created manual snapshot ${snapshot.id} for connection ${connection.name}`);

        // TODO: Dispatch to worker (Same as triggerBackup)

        return snapshot;
    }

    async runRetentionCleanup(scheduleId: string) {
        const schedule = await this.prisma.backupSchedule.findUnique({
            where: { id: scheduleId },
        });

        if (!schedule) return;

        if (schedule.retentionCount) {
            const snapshots = await this.prisma.backupSnapshot.findMany({
                where: {
                    scheduleId,
                    status: SnapshotStatus.COMPLETED
                },
                orderBy: { createdAt: 'desc' },
                skip: schedule.retentionCount,
            });

            for (const snapshot of snapshots) {
                this.logger.log(`Purging snapshot ${snapshot.id} based on retention count policy of ${schedule.retentionCount}`);
                // In physical storage we would delete the file here
                await this.prisma.backupSnapshot.update({
                    where: { id: snapshot.id },
                    data: { status: SnapshotStatus.PURGED },
                });
            }
        }

        // Retention Days logic
        if (schedule.retentionDays) {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - schedule.retentionDays);

            const oldSnapshots = await this.prisma.backupSnapshot.findMany({
                where: {
                    scheduleId,
                    status: SnapshotStatus.COMPLETED,
                    createdAt: { lt: cutoffDate }
                },
            });

            for (const snapshot of oldSnapshots) {
                this.logger.log(`Purging snapshot ${snapshot.id} because it is older than ${schedule.retentionDays} days`);
                await this.prisma.backupSnapshot.update({
                    where: { id: snapshot.id },
                    data: { status: SnapshotStatus.PURGED },
                });
            }
        }
    }

    async createSchedule(data: {
        name: string;
        cron: string;
        connectionId: string;
        retentionCount?: number;
        retentionDays?: number;
    }) {
        return this.prisma.backupSchedule.create({
            data,
        });
    }

    async getSchedules() {
        return this.prisma.backupSchedule.findMany({
            include: { connection: true },
        });
    }
    async createScheduleForUser(userId: string, data: {
        name: string;
        cron: string;
        connectionId: string;
        retentionCount?: number;
        retentionDays?: number;
    }) {
        const connection = await this.prisma.databaseConnection.findUnique({
            where: { id: data.connectionId },
            include: { project: true }
        });

        if (!connection) {
            throw new NotFoundException('Connection not found');
        }

        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { organizationId: true },
        });

        if (!user || connection.project.organizationId !== user.organizationId) {
            throw new ForbiddenException('You do not have access to this connection');
        }

        return this.prisma.backupSchedule.create({
            data,
        });
    }

    async getSchedulesForUser(userId: string, projectId?: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { organizationId: true },
        });

        if (!user || !user.organizationId) {
            return [];
        }

        const where: any = {
            connection: {
                project: {
                    organizationId: user.organizationId
                }
            }
        };

        if (projectId) {
            where.connection.projectId = projectId;
        }

        return this.prisma.backupSchedule.findMany({
            where,
            include: { connection: true },
        });
    }

    async deleteScheduleForUser(userId: string, scheduleId: string) {
        const schedule = await this.prisma.backupSchedule.findUnique({
            where: { id: scheduleId },
            include: {
                connection: {
                    include: { project: true }
                }
            }
        });

        if (!schedule) {
            throw new NotFoundException('Schedule not found');
        }

        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { organizationId: true },
        });

        if (!user || schedule.connection.project.organizationId !== user.organizationId) {
            throw new ForbiddenException('You do not have access to this schedule');
        }

        return this.prisma.backupSchedule.delete({
            where: { id: scheduleId },
        });
    }
}
