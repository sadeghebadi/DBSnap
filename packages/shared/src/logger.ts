import winston from 'winston';
import { getTraceId } from './context';

const { combine, timestamp, json, printf, colorize, simple } = winston.format;

const traceIdFormat = winston.format((info) => {
    const traceId = getTraceId();
    if (traceId) {
        info.traceId = traceId;
    }
    return info;
});

const devFormat = combine(
    colorize(),
    traceIdFormat(),
    timestamp(),
    printf(({ level, message, timestamp, traceId, ...meta }) => {
        return `${timestamp} [${level}]${traceId ? ` [${traceId}]` : ''}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
    })
);

const prodFormat = combine(
    timestamp(),
    traceIdFormat(),
    json()
);

export const createLogger = (serviceName: string) => {
    const isProduction = process.env.NODE_ENV === 'production';

    return winston.createLogger({
        level: 'info',
        defaultMeta: { service: serviceName },
        format: isProduction ? prodFormat : devFormat,
        transports: [
            new winston.transports.Console()
        ],
    });
};
