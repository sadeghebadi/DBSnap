import { Injectable, Logger, Inject } from '@nestjs/common';
import { PrismaClient } from '@dbsnap/database';
import { EmailService } from '../email/email.service';

@Injectable()
export class AnalysisService {
    private readonly logger = new Logger(AnalysisService.name);

    constructor(
        @Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient,
        private readonly emailService: EmailService
    ) { }

    async checkAnomalies(backupId: string) {
        this.logger.log(`Analyzing backup ${backupId} for anomalies...`);

        const currentBackup = await this.prisma.backup.findUnique({
            where: { id: backupId },
            include: { database: true }
        });

        if (!currentBackup) {
            this.logger.warn(`Backup ${backupId} not found, skipping analysis.`);
            return;
        }

        // Find previous successful backup for this database
        const previousBackups = await this.prisma.backup.findMany({
            where: {
                databaseId: currentBackup.databaseId,
                status: 'Completed',
                id: { not: backupId },
                // Ideally strictly 'less than' current startedAt, 
                // but ID not equal + descending sort usually suffices for "most recent before this"
                // if we assume linear time. Better: startedAt < current.startedAt
                startedAt: { lt: currentBackup.startedAt }
            },
            orderBy: { startedAt: 'desc' },
            take: 1
        });

        if (previousBackups.length === 0) {
            this.logger.log(`No previous backup found for DB ${currentBackup.databaseId}. Skipping comparison.`);
            return;
        }

        const previousBackup = previousBackups[0];
        this.detectSizeAnomaly(currentBackup, previousBackup);
    }

    private async detectSizeAnomaly(current: any, previous: any) {
        const THRESHOLD_PERCENT = 50;

        const prevSize = BigInt(previous.sizeBytes || 0);
        const currSize = BigInt(current.sizeBytes || 0);

        if (prevSize === BigInt(0)) return; // Avoid division by zero or initial state issues

        // Diff
        const diff = currSize - prevSize;
        const diffAbs = diff < 0 ? -diff : diff;

        // Calculate percentage change: (diff / prev) * 100
        // Using BigInt arithmetic roughly
        const percentChange = (diffAbs * BigInt(100)) / prevSize;

        if (percentChange > BigInt(THRESHOLD_PERCENT)) {
            const type = diff > 0 ? 'Growth Spike' : 'Shrinkage';
            const msg = `Detected ${type}: ${percentChange}% change (Prev: ${prevSize}, Curr: ${currSize})`;

            this.logger.warn(msg);

            // Send Alert
            await this.emailService.sendAnomalyAlert('user@example.com', { // TODO: User lookup
                databaseName: current.database.name,
                alertType: type,
                description: `Backup size changed by ${percentChange}% detected.`
            });
        }
    }
}
