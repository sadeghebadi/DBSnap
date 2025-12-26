import http from 'http';
import { createLogger, getConfig } from '@dbsnap/shared';

const logger = createLogger('health-check');
const config = getConfig();

export class HealthCheckServer {
    private server: http.Server;
    private isReady: boolean = false;
    private lastPulse: number = Date.now();

    constructor() {
        this.server = http.createServer((req, res) => {
            if (req.url === '/health') {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: 'UP', timestamp: new Date() }));
                return;
            }

            if (req.url === '/ready') {
                if (this.isReady) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ status: 'READY' }));
                } else {
                    res.writeHead(503, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ status: 'NOT_READY' }));
                }
                return;
            }

            res.writeHead(404);
            res.end();
        });
    }

    setReady(status: boolean) {
        this.isReady = status;
        logger.info(`Worker readiness set to: ${status}`);
    }

    updatePulse() {
        this.lastPulse = Date.now();
    }

    start() {
        const port = config.WORKER_PORT || 4001;
        this.server.listen(port, () => {
            logger.info(`Health check server listening on port ${port}`);
        });

        // Basic self-healing: Check if the process feels "stuck"
        setInterval(() => {
            const idleTime = Date.now() - this.lastPulse;
            if (idleTime > 60000) { // 1 minute of complete inactivity
                logger.warn(`Worker has been idle for ${idleTime}ms. Potential hang detected.`);
            }
        }, 30000);
    }

    stop() {
        this.server.close();
    }
}

export const healthCheckServer = new HealthCheckServer();
