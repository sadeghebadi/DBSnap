import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';

@Injectable()
export class ProjectsService {
    constructor(private prisma: PrismaService) { }

    async createProject(userId: string, name: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { organizationId: true },
        });

        if (!user || !user.organizationId) {
            throw new ForbiddenException('User must belong to an organization to create projects');
        }

        return this.prisma.project.create({
            data: {
                name,
                organizationId: user.organizationId,
            },
        });
    }

    async findAll(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { organizationId: true },
        });

        if (!user || !user.organizationId) {
            return [];
        }

        return this.prisma.project.findMany({
            where: { organizationId: user.organizationId },
        });
    }

    async findOne(userId: string, projectId: string) {
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

    async update(userId: string, projectId: string, data: { name?: string }) {
        await this.findOne(userId, projectId); // Enforce ownership

        return this.prisma.project.update({
            where: { id: projectId },
            data,
        });
    }

    async remove(userId: string, projectId: string) {
        await this.findOne(userId, projectId); // Enforce ownership

        await this.prisma.project.delete({
            where: { id: projectId },
        });

        return { message: 'Project deleted successfully' };
    }
}
