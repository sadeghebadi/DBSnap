import { Readable } from 'stream';
import split2 from 'split2';
import { IDiffEngine, DiffResult } from '../interfaces/diff.interface';
import { CoreHasher } from './hasher';

export interface SqlDiffOptions {
    primaryKey: string;
}

export class SqlDiffEngine {
    private hasher = new CoreHasher();

    async compare(streamA: Readable, streamB: Readable, options: SqlDiffOptions, metadataA?: any, metadataB?: any): Promise<DiffResult> {
        const genA = this.streamToGenerator(streamA);
        const genB = this.streamToGenerator(streamB);

        const schemaChanges = this.compareSchemas(metadataA?.schema || {}, metadataB?.schema || {});

        let itemA = await genA.next();
        let itemB = await genB.next();

        let added = 0;
        let removed = 0;
        let modified = 0;

        const pk = options.primaryKey;

        while (!itemA.done || !itemB.done) {
            const valA = itemA.value;
            const valB = itemB.value;

            if (itemA.done && valB) {
                // A exhausted, B has items -> Added
                added++;
                itemB = await genB.next();
                continue;
            }

            if (itemB.done && valA) {
                // B exhausted, A has items -> Removed
                removed++;
                itemA = await genA.next();
                continue;
            }

            if (valA && valB) {
                const pkA = valA[pk];
                const pkB = valB[pk];

                if (pkA < pkB) {
                    // A has item smaller than B -> Removed from A
                    removed++;
                    itemA = await genA.next();
                } else if (pkA > pkB) {
                    // A has item larger than B -> B must be new -> Added
                    added++;
                    itemB = await genB.next();
                } else {
                    // PKs match -> Compare Content
                    const hashA = this.hasher.hash(valA);
                    const hashB = this.hasher.hash(valB);

                    if (hashA !== hashB) {
                        modified++;
                    }

                    itemA = await genA.next();
                    itemB = await genB.next();
                }
            }
        }

        return {
            added,
            removed,
            modified,
            schemaChanges
        };
    }

    private compareSchemas(schemaA: any, schemaB: any) {
        // Expecting { indexes: [], constraints: [] }
        const changes = { added: [], removed: [], modified: [] };

        // Helper to compare arrays of strings/objects
        const compareList = (listA: string[] = [], listB: string[] = [], type: string) => {
            const setA = new Set(listA);
            const setB = new Set(listB);

            listB.forEach(item => {
                if (!setA.has(item)) changes.added.push(`${type}: ${item}`);
            });
            listA.forEach(item => {
                if (!setB.has(item)) changes.removed.push(`${type}: ${item}`);
            });
        };

        compareList(schemaA.indexes, schemaB.indexes, 'INDEX');
        compareList(schemaA.constraints, schemaB.constraints, 'CONSTRAINT');

        return changes;
    }

    private async *streamToGenerator(stream: Readable): AsyncGenerator<any> {
        const lineStream = stream.pipe(split2(JSON.parse));
        for await (const line of lineStream) {
            if (line.type === 'data') {
                yield line.doc;
            }
        }
    }
}
