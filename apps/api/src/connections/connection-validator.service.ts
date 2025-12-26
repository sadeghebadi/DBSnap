import { Injectable, Logger } from '@nestjs/common';
import pg from 'pg';
import mysql from 'mysql2/promise';
import { MongoClient } from 'mongodb';

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
}

@Injectable()
export class ConnectionValidatorService {
    private readonly logger = new Logger(ConnectionValidatorService.name);

    constructor(private readonly sshTunnelService: SshTunnelService) { }

    async validate(details: ConnectionDetails) {
        let connectionDetails = { ...details };
        let localPort: number | undefined;

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

                // Redirect DB connection through local tunnel
                connectionDetails.host = '127.0.0.1';
                connectionDetails.port = localPort;
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                this.logger.error(`Failed to establish SSH tunnel: ${message}`);
                throw new Error(`SSH Tunnel failed: ${message}`);
            }
        }

        try {
            const result = await this.performValidation(connectionDetails);
            return result;
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

    private async validatePostgres(details: ConnectionDetails) {
        const client = new pg.Client({
            host: details.host,
            port: details.port,
            database: details.databaseName,
            user: details.username,
            password: details.password,
            connectionTimeoutMillis: 5000,
        });

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
            const connection = await mysql.createConnection({
                host: details.host,
                port: details.port,
                database: details.databaseName,
                user: details.username,
                password: details.password,
                connectTimeout: 5000,
            });

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

        const client = new MongoClient(uri);

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
