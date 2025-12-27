import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';
import { CreateConnectionDto } from './dto/create-connection.dto.js';
import { UpdateConnectionDto } from './dto/update-connection.dto.js';
import { encrypt } from '@dbsnap/shared';

@Injectable()
export class ConnectionsService {
    constructor(@Inject(PrismaService) private prisma: PrismaService) { }

    private async validateProjectAccess(userId: string, projectId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { organizationId: true },
        });

        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
        });

        if (!project) {
            throw new NotFoundException('Project not found');
        }

        if (!user || project.organizationId !== user.organizationId) {
            throw new ForbiddenException('You do not have access to this project');
        }

        return project;
    }

    async create(userId: string, dto: CreateConnectionDto) {
        await this.validateProjectAccess(userId, dto.projectId);

        const data: any = {
            ...dto,
            password: encrypt(dto.password),
        };

        if (dto.sshPrivateKey) {
            data.sshPrivateKey = encrypt(dto.sshPrivateKey);
        }
        if (dto.sshPassphrase) {
            data.sshPassphrase = encrypt(dto.sshPassphrase);
        }
        if (dto.proxyPassword) {
            data.proxyPassword = encrypt(dto.proxyPassword);
        }
        if (dto.sslCA) {
            data.sslCA = encrypt(dto.sslCA);
        }
        if (dto.sslCert) {
            data.sslCert = encrypt(dto.sslCert);
        }
        if (dto.sslKey) {
            data.sslKey = encrypt(dto.sslKey);
        }

        return this.prisma.databaseConnection.create({
            data,
        });
    }

    async findAll(userId: string, projectId?: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { organizationId: true },
        });

        if (!user || !user.organizationId) {
            return [];
        }

        const where: { project: { organizationId: string }; projectId?: string } = {
            project: {
                organizationId: user.organizationId,
            },
        };

        if (projectId) {
            where.projectId = projectId;
        }

        return this.prisma.databaseConnection.findMany({
            where,
            include: {
                project: {
                    select: {
                        name: true,
                    }
                },
                snapshots: {
                    take: 1,
                    orderBy: {
                        createdAt: 'desc'
                    },
                    select: {
                        createdAt: true,
                        status: true
                    }
                }
            }
        });
    }

    async findOne(userId: string, id: string) {
        const connection = await this.prisma.databaseConnection.findUnique({
            where: { id },
            include: {
                project: true,
            },
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

        return connection;
    }

    async update(userId: string, id: string, dto: UpdateConnectionDto) {
        const connection = await this.findOne(userId, id);

        const data: any = { ...dto };
        if (dto.password) {
            data.password = encrypt(dto.password);
        }
        if (dto.sshPrivateKey) {
            data.sshPrivateKey = encrypt(dto.sshPrivateKey);
        }
        if (dto.sshPassphrase) {
            data.sshPassphrase = encrypt(dto.sshPassphrase);
        }
        if (dto.proxyPassword) {
            data.proxyPassword = encrypt(dto.proxyPassword);
        }
        if (dto.sslCA) {
            data.sslCA = encrypt(dto.sslCA);
        }
        if (dto.sslCert) {
            data.sslCert = encrypt(dto.sslCert);
        }
        if (dto.sslKey) {
            data.sslKey = encrypt(dto.sslKey);
        }

        if (dto.projectId && dto.projectId !== connection.projectId) {
            await this.validateProjectAccess(userId, dto.projectId);
        }

        return this.prisma.databaseConnection.update({
            where: { id },
            data,
        });
    }

    async remove(userId: string, id: string) {
        await this.findOne(userId, id);

        await this.prisma.databaseConnection.delete({
            where: { id },
        });

        return { message: 'Connection deleted successfully' };
    }
}
