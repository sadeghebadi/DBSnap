import pg from 'pg';
import { IDatabaseLoader, LoaderOptions } from './base.loader.js';

export class PostgresLoader implements IDatabaseLoader {
    private client?: pg.Client;
    private preparedTables: Set<string> = new Set();

    async connect(options: LoaderOptions): Promise<void> {
        this.client = new pg.Client({
            host: options.host,
            port: options.port,
            database: options.database,
            user: options.username,
            password: options.password,
        });
        await this.client.connect();
    }

    async prepareTable(tableName: string, mode: 'OVERWRITE' | 'APPEND'): Promise<void> {
        if (this.preparedTables.has(tableName)) return;

        if (mode === 'OVERWRITE') {
            // CAUTION: This deletes all data!
            await this.client?.query(`TRUNCATE TABLE "${tableName}" CASCADE`);
        }

        this.preparedTables.add(tableName);
    }

    async loadObject(tableName: string, data: any): Promise<void> {
        const columns = Object.keys(data);
        const values = Object.values(data);
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');

        const query = `INSERT INTO "${tableName}" ("${columns.join('", "')}") VALUES (${placeholders})`;
        await this.client?.query(query, values);
    }

    async disconnect(): Promise<void> {
        await this.client?.end();
    }
}
