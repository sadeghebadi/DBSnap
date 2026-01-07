import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Environment } from '@prisma/client';

@Injectable()
export class ProjectsService {
    constructor(private prisma: PrismaService) { }

    async create(userId: string, data: { name: string; environment?: Environment }) {
        return this.prisma.project.create({
            data: {
                ...data,
                userId,
            },
        });
    }

    async findAll(userId: string) {
        return this.prisma.project.findMany({
            where: { userId },
        });
    }

    async findOne(userId: string, id: string) {
        const project = await this.prisma.project.findFirst({
            where: { id, userId },
            include: { databases: true },
        });
        if (!project) throw new NotFoundException('Project not found');
        return project;
    }

    async update(userId: string, id: string, data: { name?: string; environment?: Environment }) {
        const project = await this.prisma.project.findFirst({ where: { id, userId } });
        if (!project) throw new NotFoundException('Project not found');

        return this.prisma.project.update({
            where: { id },
            data,
        });
    }

    async remove(userId: string, id: string) {
        const project = await this.prisma.project.findFirst({ where: { id, userId } });
        if (!project) throw new NotFoundException('Project not found');

        return this.prisma.project.delete({
            where: { id },
        });
    }
}
