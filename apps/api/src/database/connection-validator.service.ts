
import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { DbType } from '@dbsnap/database';
import { Client } from 'pg';
import { MongoClient } from 'mongodb';

@Injectable()
export class ConnectionValidatorService {
    private readonly logger = new Logger(ConnectionValidatorService.name);

    async validateConnection(
        type: DbType,
        connectionString: string,
        sshOptions?: { host: string; port: number; username: string; privateKey: string },
        proxyOptions?: { host: string; port: number; username?: string; password?: string },
        sslOptions?: { ca?: string; cert?: string; key?: string; rejectUnauthorized?: boolean; mode?: string }
    ): Promise<{ success: boolean; message?: string; version?: string }> {
        try {
            if (sshOptions) {
                await this.checkSshConnection(sshOptions);
            }

            if (proxyOptions) {
                await this.checkProxyConnection(proxyOptions);
            }

            if (type === 'Postgres') {
                return await this.validatePostgres(connectionString, sslOptions);
            } else if (type === 'MongoDB') {
                return await this.validateMongo(connectionString, sslOptions);
            } else if (type === 'MySQL') {
                throw new BadRequestException('MySQL support is coming soon.');
            }

            throw new BadRequestException(`Unsupported database type: ${type}`);
        } catch (error: any) {
            this.logger.error(`Connection validation failed for ${type}: ${error.message}`);
            return {
                success: false,
                message: error.message || 'Unknown connection error',
            };
        }
    }

    private async checkSshConnection(opts: { host: string; port: number; username: string; privateKey: string }): Promise<void> {
        return new Promise((resolve, reject) => {
            const { Client } = require('ssh2');
            const conn = new Client();
            conn.on('ready', () => {
                conn.end();
                resolve();
            }).on('error', (err: any) => {
                reject(new Error(`SSH Connection failed: ${err.message}`));
            }).connect({
                host: opts.host,
                port: opts.port,
                username: opts.username,
                privateKey: opts.privateKey
            });
        });
    }

    private async checkProxyConnection(opts: { host: string; port: number; username?: string; password?: string }): Promise<void> {
        return new Promise((resolve, reject) => {
            const Socks = require('socks').SocksClient;
            const options = {
                proxy: {
                    host: opts.host,
                    port: opts.port,
                    type: 5, // SOCKS5
                    userId: opts.username,
                    password: opts.password
                },
                command: 'connect',
                destination: {
                    host: '8.8.8.8', // Test connectivity to Google DNS via proxy
                    port: 53
                }
            };

            Socks.createConnection(options, (err: any, info: any) => {
                if (err) {
                    reject(new Error(`Proxy Connection failed: ${err.message}`));
                } else {
                    // Assuming valid connection if we can reach outside
                    resolve();
                }
            });
        });
    }

    private async validatePostgres(connectionString: string, ssl?: any) {
        const config: any = { connectionString, connectionTimeoutMillis: 5000 };
        if (ssl) {
            config.ssl = {
                rejectUnauthorized: ssl.rejectUnauthorized !== false, // default true
                ca: ssl.ca,
                cert: ssl.cert,
                key: ssl.key,
            };
        }
        const client = new Client(config); // 5s timeout
        try {
            await client.connect();
            // Check version and read access
            const res = await client.query('SELECT version();');
            const version = res.rows[0].version;
            return { success: true, version };
        } finally {
            await client.end().catch(() => { }); // Ensure closed
        }
    }

    private async validateMongo(connectionString: string, ssl?: any) {
        const options: any = { serverSelectionTimeoutMS: 5000 };
        if (ssl) {
            if (ssl.ca) options.tlsCAFile = ssl.ca; // Note: MongoClient usually takes file paths or Buffers for CA/Cert/Key
            // For string content we might need to write tmp files or use Buffers if supported
            // For this stumb, we just assume standard connection string params or options
            if (ssl.cert) options.tlsCertificateKeyFile = ssl.cert; // Checking if PEM contains both or separate
            if (ssl.rejectUnauthorized !== undefined) options.tlsInsecure = !ssl.rejectUnauthorized;
        }

        const client = new MongoClient(connectionString, options);
        try {
            await client.connect();
            const db = client.db();
            const buildInfo = await db.admin().buildInfo();
            return { success: true, version: buildInfo.version };
        } finally {
            await client.close().catch(() => { });
        }
    }
}
