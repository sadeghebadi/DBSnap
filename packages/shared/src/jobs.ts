import { getConfig } from './config.js';

export enum QueueNames {
    BACKUP = 'dbsnap:backup',
    RESTORE = 'dbsnap:restore',
    DIFF = 'dbsnap:diff',
}

export const getRedisConnection = () => {
    const config = getConfig();
    const url = new URL(config.REDIS_URL);

    return {
        host: url.hostname || 'localhost',
        port: parseInt(url.port, 10) || 6379,
        password: url.password || undefined,
        maxRetriesPerRequest: null, // Required by BullMQ
    };
};
