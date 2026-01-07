import { Readable } from 'stream';
import split2 from 'split2';
import { IDiffEngine, DiffResult } from '../interfaces/diff.interface';
import { CoreHasher } from './hasher';

export class MongoDiffEngine implements IDiffEngine {
    private hasher = new CoreHasher();

    async compare(streamA: Readable, streamB: Readable, metadataA?: any, metadataB?: any): Promise<DiffResult> {
        const mapA = new Map<string, string>();

        // Compare Schemas (Indexes)
        const schemaChanges = this.compareSchemas(metadataA?.indexes || [], metadataB?.indexes || []);

        // 1. Build Map from Stream A
        const buildStream = streamA.pipe(split2(JSON.parse));
        for await (const line of buildStream) {
            if (line.type === 'data') {
                const doc = line.doc;
                const id = this.getId(doc);
                const hash = this.hasher.hash(doc);
                mapA.set(id, hash);
            }
        }

        let added = 0;
        let modified = 0;
        let removed = 0;

        // 2. Compare with Stream B
        const compareStream = streamB.pipe(split2(JSON.parse));
        for await (const line of compareStream) {
            if (line.type === 'data') {
                const doc = line.doc;
                const id = this.getId(doc);
                const hashB = this.hasher.hash(doc);

                if (mapA.has(id)) {
                    const hashA = mapA.get(id);
                    if (hashA !== hashB) {
                        modified++;
                    }
                    mapA.delete(id); // Mark as visited
                } else {
                    added++;
                }
            }
        }

        // 3. Remaining items in MapA are removed
        removed = mapA.size;

        return {
            added,
            removed,
            modified,
            schemaChanges
        };
    }

    private getId(doc: any): string {
        if (!doc._id) return JSON.stringify(doc); // Fallback
        return typeof doc._id === 'object' ? JSON.stringify(doc._id) : String(doc._id);
    }

    private compareSchemas(indexesA: any[], indexesB: any[]) {
        const setA = new Set(indexesA.map(i => JSON.stringify(i)));
        const setB = new Set(indexesB.map(i => JSON.stringify(i)));

        const added = indexesB.filter(i => !setA.has(JSON.stringify(i))).map(i => `INDEX: ${i.name || JSON.stringify(i.key)}`);
        const removed = indexesA.filter(i => !setB.has(JSON.stringify(i))).map(i => `INDEX: ${i.name || JSON.stringify(i.key)}`);

        return { added, removed, modified: [] };
    }
}
