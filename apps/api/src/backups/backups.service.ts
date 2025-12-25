import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../database/prisma.service.js';
import { SnapshotStatus } from '@dbsnap/database';

@Injectable()
export class BackupsService {
    private readonly logger = new Logger(BackupsService.name);

    constructor(private prisma: PrismaService) { }

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

        // TODO: Implement retentionDays logic
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
}
