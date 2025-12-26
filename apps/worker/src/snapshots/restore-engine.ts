import { Readable } from 'stream';
import { IStorageAdapter } from '../storage/storage-adapter.interface.js';
import { createInterface } from 'readline';
import { IDatabaseLoader, LoaderOptions, RestoreOptions } from './loaders/base.loader.js';
import { LoaderFactory } from './loaders/loader.factory.js';
// We'll stub MySQL and Mongo loaders for now to focus on the core logic

export interface RestoreSummary {
    engine: string;
    timestamp: string;
    tableCounts: Record<string, number>;
    totalRows: number;
}

export class RestoreEngine {
    constructor(private storage: IStorageAdapter) { }

    async getSnapshotSummary(storageKey: string): Promise<RestoreSummary> {
        const stream = await this.storage.download(storageKey);
        const rl = createInterface({
            input: stream,
            terminal: false
        });

        const summary: RestoreSummary = {
            engine: 'Unknown',
            timestamp: '',
            tableCounts: {},
            totalRows: 0
        };

        for await (const line of rl) {
            if (!line.trim()) continue;

            try {
                const entry = JSON.parse(line);
                if (entry.type === 'header') {
                    summary.engine = entry.metadata.engine;
                    summary.timestamp = entry.metadata.timestamp;
                } else if (entry.type === 'row' || entry.type === 'document') {
                    const tableName = entry.table || entry.collection;
                    summary.tableCounts[tableName] = (summary.tableCounts[tableName] || 0) + 1;
                    summary.totalRows++;
                }
            } catch (err) {
                // Ignore malformed lines? Or fail? For now, just skip.
            }
        }

        return summary;
    }

    async applyRestore(
        storageKey: string,
        targetType: 'POSTGRESQL' | 'MYSQL' | 'MONGODB',
        targetDetails: LoaderOptions,
        options: RestoreOptions
    ): Promise<void> {
        const loader = LoaderFactory.createLoader(targetType);

        await loader.connect(targetDetails);

        try {
            const stream = await this.storage.download(storageKey);
            const rl = createInterface({ input: stream, terminal: false });

            for await (const line of rl) {
                if (!line.trim()) continue;
                const entry = JSON.parse(line);

                if (entry.type === 'row' || entry.type === 'document') {
                    const tableName = entry.table || entry.collection;

                    // Filter by selected tables if provided
                    if (options.tables && options.tables.length > 0 && !options.tables.includes(tableName)) {
                        continue;
                    }

                    await loader.prepareTable(tableName, options.mode);
                    await loader.loadObject(tableName, entry.data);
                }
            }
        } finally {
            await loader.disconnect();
        }
    }
}
