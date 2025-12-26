import { Injectable, Logger } from '@nestjs/common';
import pg from 'pg';
import mysql from 'mysql2/promise';
import { MongoClient, MongoClientOptions } from 'mongodb';
import { SocksProxyAgent } from 'socks-proxy-agent';
import { HttpProxyAgent } from 'http-proxy-agent';

import { SshTunnelService } from './ssh-tunnel.service.js';

export enum DatabaseType {
    POSTGRESQL = 'POSTGRESQL',
    MYSQL = 'MYSQL',
    MONGODB = 'MONGODB',
}

export interface ConnectionDetails {
    type: DatabaseType;
    host: string;
    port: number;
    databaseName: string;
    username: string;
    password: string;
    sshEnabled?: boolean;
    sshHost?: string;
    sshPort?: number;
    sshUsername?: string;
    sshPrivateKey?: string;
    sshPassphrase?: string;
    proxyEnabled?: boolean;
    proxyHost?: string;
    proxyPort?: number;
    proxyType?: string;
    proxyUsername?: string;
    proxyPassword?: string;
    sslEnabled?: boolean;
    sslCA?: string;
    sslCert?: string;
    sslKey?: string;
}

@Injectable()
export class ConnectionValidatorService {
    private readonly logger = new Logger(ConnectionValidatorService.name);

    constructor(private readonly sshTunnelService: SshTunnelService) { }

    async validate(details: ConnectionDetails) {
        let connectionDetails = { ...details };
        let localPort: number | undefined;

        // SSH Tunnel takes precedence if enabled
        if (details.sshEnabled) {
            localPort = Math.floor(Math.random() * (65535 - 10000 + 1) + 10000);
            try {
                await this.sshTunnelService.createTunnel({
                    host: details.sshHost!,
                    port: details.sshPort || 22,
                    username: details.sshUsername!,
                    privateKey: details.sshPrivateKey!,
                    passphrase: details.sshPassphrase,
                    dstHost: details.host,
                    dstPort: details.port,
                    localPort,
                });

                connectionDetails.host = '127.0.0.1';
                connectionDetails.port = localPort;
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                this.logger.error(`Failed to establish SSH tunnel: ${message}`);
                throw new Error(`SSH Tunnel failed: ${message}`);
            }
        }

        try {
            return await this.performValidation(connectionDetails);
        } finally {
            if (localPort) {
                await this.sshTunnelService.closeTunnel(localPort);
            }
        }
    }

    private async performValidation(details: ConnectionDetails) {
        switch (details.type) {
            case DatabaseType.POSTGRESQL:
                return this.validatePostgres(details);
            case DatabaseType.MYSQL:
                return this.validateMysql(details);
            case DatabaseType.MONGODB:
                return this.validateMongodb(details);
            default:
                throw new Error(`Unsupported database type: ${details.type}`);
        }
    }

    private getProxyAgent(details: ConnectionDetails) {
        const auth = details.proxyUsername && details.proxyPassword
            ? `${details.proxyUsername}:${details.proxyPassword}@`
            : '';
        const url = `${details.proxyType === 'SOCKS5' ? 'socks5' : 'http'}://${auth}${details.proxyHost}:${details.proxyPort}`;

        return details.proxyType === 'SOCKS5'
            ? new SocksProxyAgent(url)
            : new HttpProxyAgent(url);
    }

    private async validatePostgres(details: ConnectionDetails) {
        const connectionOptions: any = {
            host: details.host,
            port: details.port,
            database: details.databaseName,
            user: details.username,
            password: details.password,
            connectionTimeoutMillis: 5000,
        };

        if (details.proxyEnabled) {
            const agent: any = this.getProxyAgent(details);
            connectionOptions.stream = agent.createConnection({ host: details.host, port: details.port });
        }

        if (details.sslEnabled) {
            connectionOptions.ssl = {
                ca: details.sslCA,
                cert: details.sslCert,
                key: details.sslKey,
                rejectUnauthorized: !!details.sslCA,
            };
        }

        const client = new pg.Client(connectionOptions);

        try {
            await client.connect();
            const res = await client.query('SELECT version()');
            await client.end();
            return {
                success: true,
                metadata: {
                    version: res.rows[0].version,
                    engine: 'PostgreSQL',
                },
            };
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            this.logger.error(`Postgres connection failed: ${message}`);
            throw new Error(`Connection failed: ${message}`);
        }
    }

    private async validateMysql(details: ConnectionDetails) {
        try {
            const connectionOptions: any = {
                host: details.host,
                port: details.port,
                database: details.databaseName,
                user: details.username,
                password: details.password,
                connectTimeout: 5000,
            };

            if (details.proxyEnabled) {
                const agent: any = this.getProxyAgent(details);
                connectionOptions.stream = agent.createConnection({ host: details.host, port: details.port });
            }

            if (details.sslEnabled) {
                connectionOptions.ssl = {
                    ca: details.sslCA,
                    cert: details.sslCert,
                    key: details.sslKey,
                };
            }

            const connection = await mysql.createConnection(connectionOptions);

            const [rows] = await connection.execute('SELECT VERSION() as version') as [({ version: string })[], unknown];
            await connection.end();

            return {
                success: true,
                metadata: {
                    version: rows[0].version,
                    engine: 'MySQL',
                },
            };
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            this.logger.error(`MySQL connection failed: ${message}`);
            throw new Error(`Connection failed: ${message}`);
        }
    }

    private async validateMongodb(details: ConnectionDetails) {
        // Construct MongoDB URI securely (user:pass@host:port/db)
        const auth = details.username && details.password
            ? `${encodeURIComponent(details.username)}:${encodeURIComponent(details.password)}@`
            : '';
        const uri = `mongodb://${auth}${details.host}:${details.port}/${details.databaseName}?serverSelectionTimeoutMS=5000`;

        const options: MongoClientOptions = {
            serverSelectionTimeoutMS: 5000,
        };

        if (details.proxyEnabled && details.proxyType === 'SOCKS5') {
            (options as any).proxyHost = details.proxyHost;
            (options as any).proxyPort = details.proxyPort;
            (options as any).proxyUsername = details.proxyUsername;
            (options as any).proxyPassword = details.proxyPassword;
        }

        if (details.sslEnabled) {
            options.tls = true;
            if (details.sslCA) options.tlsCAFile = details.sslCA; // Note: MongoDB driver might need file paths, but we store content. Some drivers allow content.
            if (details.sslCert) options.tlsCertificateKeyFile = details.sslCert;
        }

        const client = new MongoClient(uri, options);

        try {
            await client.connect();
            const db = client.db(details.databaseName);
            const buildInfo = await db.admin().command({ buildInfo: 1 });
            await client.close();

            return {
                success: true,
                metadata: {
                    version: buildInfo.version,
                    engine: 'MongoDB',
                },
            };
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            this.logger.error(`MongoDB connection failed: ${message}`);
            throw new Error(`Connection failed: ${message}`);
        }
    }
}
