import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationChannelType } from '@prisma/client';

@Injectable()
export class NotificationsService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(projectId: string) {
        return this.prisma.notificationChannel.findMany({
            where: { projectId },
        });
    }

    async create(projectId: string, data: {
        type: NotificationChannelType;
        config: any;
        events?: string[];
        isEnabled?: boolean;
    }) {
        return this.prisma.notificationChannel.create({
            data: {
                projectId,
                type: data.type,
                config: data.config,
                events: data.events,
                isEnabled: data.isEnabled ?? true,
            },
        });
    }

    async update(id: string, data: any) {
        return this.prisma.notificationChannel.update({
            where: { id },
            data,
        });
    }

    async remove(id: string) {
        return this.prisma.notificationChannel.delete({
            where: { id },
        });
    }
}
