import { IDumper, DumpMetadata } from './dumper.interface';
import { Writable } from 'stream';
import { Client } from 'pg';
import QueryStream from 'pg-query-stream';

export class PostgresDumper implements IDumper {
    async dump(connectionString: string, stream: Writable): Promise<DumpMetadata> {
        const client = new Client({ connectionString });
        await client.connect();

        try {
            // 1. Get list of tables
            const tablesRes = await client.query(`
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
            `);
            const tables = tablesRes.rows.map(r => r.table_name);

            const metadata: DumpMetadata = {
                totalRows: 0,
                collectionCounts: {},
                schema: {
                    indexes: [],
                    constraints: []
                }
            };

            // Fetch Indexes
            const indexesRes = await client.query(`
                SELECT indexname, indexdef 
                FROM pg_indexes 
                WHERE schemaname = 'public'
            `);
            metadata.schema!.indexes = indexesRes.rows.map(r => r.indexdef);

            // Fetch Constraints (Basic)
            const constraintsRes = await client.query(`
                SELECT conname, pg_get_constraintdef(oid) as condef 
                FROM pg_constraint 
                WHERE connamespace = 'public'::regnamespace
            `);
            metadata.schema!.constraints = constraintsRes.rows.map(r => `${r.conname}: ${r.condef}`);

            for (const table of tables) {
                // Stream each table
                const countRes = await client.query(`SELECT COUNT(*) FROM "${table}"`);
                const count = parseInt(countRes.rows[0].count, 10);
                metadata.collectionCounts[table] = count;
                metadata.totalRows += count;

                // Create a stream for the table data
                // We format it as JSONL: { "table": "name", "rows": [...] } 
                // However, streaming massive arrays in one object is hard.
                // Better approach for JSONL: One line per batch or row.
                // Let's do: { "type": "data", "table": "users", "row": {...} }

                const query = new QueryStream(`SELECT * FROM "${table}"`);
                const dbStream = client.query(query);

                await new Promise<void>((resolve, reject) => {
                    dbStream.on('data', (row: any) => {
                        const json = JSON.stringify({ type: 'data', table, row }) + '\n';
                        stream.write(json);
                    });
                    dbStream.on('end', resolve);
                    dbStream.on('error', reject);
                });
            }

            return metadata;
        } finally {
            await client.end();
            stream.end();
        }
    }
}
