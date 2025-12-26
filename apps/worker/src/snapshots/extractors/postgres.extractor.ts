import pg from 'pg';
import { Readable, PassThrough } from 'stream';
import { IDatabaseExtractor, ExtractorOptions, ExtractionResult } from './base.extractor.js';

export class PostgresExtractor implements IDatabaseExtractor {
    async extract(options: ExtractorOptions): Promise<ExtractionResult> {
        const client = new pg.Client({
            host: options.host,
            port: options.port,
            database: options.database,
            user: options.username,
            password: options.password,
        });

        await client.connect();

        // 1. Get list of tables
        const tablesRes = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
        `);
        const tables = tablesRes.rows.map(r => r.table_name);

        const outputStream = new PassThrough();

        // Background processing to keep the stream moving
        (async () => {
            try {
                outputStream.write(JSON.stringify({
                    type: 'header',
                    metadata: { engine: 'PostgreSQL', tables, timestamp: new Date().toISOString() }
                }) + '\n');

                for (const table of tables) {
                    outputStream.write(JSON.stringify({ type: 'table_start', name: table }) + '\n');

                    // Simple full table scan for MVP. 
                    // In a production environment, we'd use CURSOR or batches for very large tables.
                    const res = await client.query(`SELECT * FROM "${table}"`);
                    for (const row of res.rows) {
                        outputStream.write(JSON.stringify({ type: 'row', table, data: row }) + '\n');
                    }

                    outputStream.write(JSON.stringify({ type: 'table_end', name: table }) + '\n');
                }

                outputStream.end();
            } catch (err) {
                outputStream.emit('error', err);
            } finally {
                await client.end();
            }
        })();

        return {
            stream: outputStream,
            metadata: {
                engine: 'PostgreSQL',
                tables
            }
        };
    }
}
