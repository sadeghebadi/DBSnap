import { Queue } from 'bullmq';
import { QueueNames, getRedisConnection, createLogger } from '@dbsnap/shared';
import { prisma } from '../prisma.js';

const logger = createLogger('notifications-helper');
let notificationQueue: Queue | null = null;

function getQueue() {
    if (!notificationQueue) {
        notificationQueue = new Queue(QueueNames.NOTIFICATIONS, {
            connection: getRedisConnection(),
        });
    }
    return notificationQueue;
}

export async function pushNotification(params: {
    type: 'snapshot' | 'diff';
    status: 'completed' | 'failed';
    projectId?: string;
    connectionId?: string;
    details?: string;
    resultKey?: string;
}) {
    try {
        const queue = getQueue();

        // Find connection and project info to get the organization and users
        const connection = await prisma.databaseConnection.findUnique({
            where: { id: params.connectionId },
            include: {
                project: {
                    include: {
                        organization: {
                            include: {
                                users: true
                            }
                        }
                    }
                }
            }
        });

        if (!connection) {
            logger.warn(`Could not find connection ${params.connectionId} for notification`);
            return;
        }

        const users = connection.project.organization.users;

        // Notify all users in the organization for now
        for (const user of users) {
            await queue.add('send-notification', {
                type: params.type,
                status: params.status,
                userEmail: user.email,
                connectionName: connection.name,
                details: params.details,
                resultKey: params.resultKey,
            });
        }

        logger.info(`Pushed ${params.type} notification for ${users.length} users`);
    } catch (err: any) {
        logger.error(`Failed to push notification: ${err.message}`);
    }
}
