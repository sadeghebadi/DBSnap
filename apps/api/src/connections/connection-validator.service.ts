import { Injectable, Logger } from '@nestjs/common';
import pg from 'pg';
import mysql from 'mysql2/promise';
import { MongoClient } from 'mongodb';

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
}

@Injectable()
export class ConnectionValidatorService {
    private readonly logger = new Logger(ConnectionValidatorService.name);

    async validate(details: ConnectionDetails) {
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
