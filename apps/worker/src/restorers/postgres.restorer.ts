import { IRestorer, RestoreOptions } from './restorer.interface';
import { Readable } from 'stream';
import { Client } from 'pg';
import split2 from 'split2';

export class PostgresRestorer implements IRestorer {
    async restore(connectionString: string, stream: Readable, options: RestoreOptions = {}): Promise<void> {
        const client = new Client({ connectionString });
        await client.connect();

        const { tables, mode = 'append' } = options;
        const truncatedTables = new Set<string>();

        try {
            const lineStream = stream.pipe(split2(JSON.parse));

            for await (const line of lineStream) {
                if (line.type === 'data') {
                    const { table, row } = line;

                    // Filter
                    if (tables && tables.length > 0 && !tables.includes(table)) {
                        continue;
                    }

                    // Overwrite logic - Truncate once per table
                    if (mode === 'overwrite' && !truncatedTables.has(table)) {
                        await client.query(`TRUNCATE TABLE "${table}" CASCADE`);
                        truncatedTables.add(table);
                    }

                    const keys = Object.keys(row);
                    const values = Object.values(row);

                    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
                    const columns = keys.map(k => `"${k}"`).join(', ');

                    const query = `INSERT INTO "${table}" (${columns}) VALUES (${placeholders})`;

                    try {
                        await client.query(query, values);
                    } catch (err: any) {
                        // console.warn(`Failed to insert row into ${table}: ${err.message}`);
                    }
                }
            }
        } finally {
            await client.end();
        }
    }
}
