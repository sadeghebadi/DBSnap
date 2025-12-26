import mysql from 'mysql2/promise';
import { PassThrough } from 'stream';
import { IDatabaseExtractor, ExtractorOptions, ExtractionResult } from './base.extractor.js';

export class MySqlExtractor implements IDatabaseExtractor {
    async extract(options: ExtractorOptions): Promise<ExtractionResult> {
        const connection = await mysql.createConnection({
            host: options.host,
            port: options.port,
            database: options.database,
            user: options.username,
            password: options.password,
        });

        // 1. Get list of tables
        const [rows] = await connection.execute(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = ? AND table_type = 'BASE TABLE'
        `, [options.database || 'public']);

        const tables = (rows as any[]).map(r => r.table_name);

        const outputStream = new PassThrough();

        (async () => {
            try {
                outputStream.write(JSON.stringify({
                    type: 'header',
                    metadata: { engine: 'MySQL', tables, timestamp: new Date().toISOString() }
                }) + '\n');

                for (const table of tables) {
                    // Get indexes
                    const [indexRows] = await connection.execute(`
                        SELECT INDEX_NAME as indexname, COLUMN_NAME, NON_UNIQUE
                        FROM information_schema.STATISTICS
                        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
                    `, [options.database, table]);

                    // Get constraints
                    const [constRows] = await connection.execute(`
                        SELECT CONSTRAINT_NAME as conname, COLUMN_NAME, REFERENCED_TABLE_NAME
                        FROM information_schema.KEY_COLUMN_USAGE
                        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND REFERENCED_TABLE_NAME IS NOT NULL
                    `, [options.database, table]);

                    outputStream.write(JSON.stringify({
                        type: 'table_start',
                        name: table,
                        schema: {
                            indexes: indexRows,
                            constraints: constRows
                        }
                    }) + '\n');

                    const [dataRows] = await connection.execute(`SELECT * FROM \`${table}\``);
                    for (const row of dataRows as any[]) {
                        outputStream.write(JSON.stringify({ type: 'row', table, data: row }) + '\n');
                    }

                    outputStream.write(JSON.stringify({ type: 'table_end', name: table }) + '\n');
                }

                outputStream.end();
            } catch (err) {
                outputStream.emit('error', err);
            } finally {
                await connection.end();
            }
        })();

        return {
            stream: outputStream,
            metadata: {
                engine: 'MySQL',
                tables
            }
        };
    }
}
