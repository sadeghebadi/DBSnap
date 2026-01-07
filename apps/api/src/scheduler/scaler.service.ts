import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { QueueAdminService } from '../queues/queue-admin.service';
import { BACKUP_QUEUE } from '../queues/queue.constants';

@Injectable()
export class ScalerService {
    private readonly logger = new Logger(ScalerService.name);

    constructor(private readonly queueAdminService: QueueAdminService) { }

    @Cron(CronExpression.EVERY_MINUTE)
    async checkQueueDepth() {
        // Only checking Backup Queue for now as primary driver
        const status = await this.queueAdminService.getQueueStatus(BACKUP_QUEUE);
        const totalLoad = status.waiting + status.active;

        this.logger.log(`[Scaler] Backup Queue Load: ${totalLoad} (Waiting: ${status.waiting}, Active: ${status.active})`);

        if (totalLoad > 50) {
            this.logger.warn(`[Scaler] HIGH LOAD DETECTED. Recommendation: SCALE UP WORKERS.`);
            // In a real system: trigger K8s HPA or AWS AutoScaling API
        } else if (totalLoad === 0) {
            this.logger.log(`[Scaler] System Idle. Recommendation: SCALE DOWN (min replicas).`);
        }
    }
}
