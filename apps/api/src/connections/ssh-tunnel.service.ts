import { Injectable, Logger } from '@nestjs/common';
import { Client } from 'ssh2';
import * as net from 'net';

export interface SshConfig {
    host: string;
    port: number;
    username: string;
    privateKey: string;
    passphrase?: string;
    dstHost: string;
    dstPort: number;
    localPort: number;
}

@Injectable()
export class SshTunnelService {
    private readonly logger = new Logger(SshTunnelService.name);
    private tunnels: Map<string, { client: Client; server: net.Server }> = new Map();

    async createTunnel(config: SshConfig): Promise<void> {
        return new Promise((resolve, reject) => {
            const ssh = new Client();
            const server = net.createServer((sock) => {
                ssh.forwardOut(
                    '127.0.0.1',
                    sock.remotePort || 0,
                    config.dstHost,
                    config.dstPort,
                    (err, stream) => {
                        if (err) {
                            this.logger.error('SSH forwardOut error', err);
                            sock.end();
                            return;
                        }
                        sock.pipe(stream).pipe(sock);
                    },
                );
            });

            ssh
                .on('ready', () => {
                    server.listen(config.localPort, '127.0.0.1', () => {
                        this.logger.log(`SSH Tunnel established: 127.0.0.1:${config.localPort} -> ${config.dstHost}:${config.dstPort}`);
                        const tunnelId = `${config.localPort}`;
                        this.tunnels.set(tunnelId, { client: ssh, server });
                        resolve();
                    });
                })
                .on('error', (err) => {
                    this.logger.error('SSH Client Error', err);
                    reject(err);
                })
                .connect({
                    host: config.host,
                    port: config.port,
                    username: config.username,
                    privateKey: config.privateKey,
                    passphrase: config.passphrase,
                });

            server.on('error', (err) => {
                this.logger.error('Local Server Error', err);
                ssh.end();
                reject(err);
            });
        });
    }

    async closeTunnel(localPort: number): Promise<void> {
        const tunnelId = `${localPort}`;
        const tunnel = this.tunnels.get(tunnelId);
        if (tunnel) {
            return new Promise((resolve) => {
                tunnel.server.close(() => {
                    tunnel.client.end();
                    this.tunnels.delete(tunnelId);
                    this.logger.log(`SSH Tunnel closed for port ${localPort}`);
                    resolve();
                });
            });
        }
    }

    async closeAll(): Promise<void> {
        const ports = Array.from(this.tunnels.keys()).map(Number);
        for (const port of ports) {
            await this.closeTunnel(port);
        }
    }
}
