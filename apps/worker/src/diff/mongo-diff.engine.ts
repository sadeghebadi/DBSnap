import { DiffEngine } from './diff-engine.service.js';
import { DiffResult, DiffDetail, TableDiffSummary } from './diff-result.interface.js';
import { areObjectsEqual } from './utils/object-diff.utils.js';

export class MongoDiffEngine extends DiffEngine {
    async compare(snapshotAKey: string, snapshotBKey: string): Promise<DiffResult> {
        const iterA = this.getSnapshotIterator(snapshotAKey);
        const iterB = this.getSnapshotIterator(snapshotBKey);

        return this.compareIterators(iterA, iterB, snapshotAKey, snapshotBKey);
    }

    async compareIterators(
        iterA: AsyncIterable<any>,
        iterB: AsyncIterable<any>,
        keyA: string,
        keyB: string
    ): Promise<DiffResult> {
        const result: DiffResult = {
            snapshotA: keyA,
            snapshotB: keyB,
            timestamp: new Date().toISOString(),
            summary: { totalAdded: 0, totalRemoved: 0, totalModified: 0 },
            tables: [],
            details: []
        };

        const mapA = new Map<string, Record<string, any>>();
        const mapB = new Map<string, Record<string, any>>();
        const schemaA = new Map<string, any>();
        const schemaB = new Map<string, any>();

        // For MVP, we load documents into memory.
        // In ISSUE-037/046 we would use external sorting or a local DB for 10GB+ snapshots.

        for await (const entry of iterA) {
            if (entry.type === 'collection_start') {
                schemaA.set(entry.name, entry.schema);
            } else if (entry.type === 'document') {
                const collName = entry.collection;
                if (!mapA.has(collName)) mapA.set(collName, {});
                mapA.get(collName)![entry.data._id] = entry.data;
            }
        }

        for await (const entry of iterB) {
            if (entry.type === 'collection_start') {
                schemaB.set(entry.name, entry.schema);
            } else if (entry.type === 'document') {
                const collName = entry.collection;
                if (!mapB.has(collName)) mapB.set(collName, {});
                mapB.get(collName)![entry.data._id] = entry.data;
            }
        }

        const allCollections = new Set([...mapA.keys(), ...mapB.keys(), ...schemaA.keys(), ...schemaB.keys()]);

        for (const collName of allCollections) {
            const tableSummary: TableDiffSummary = {
                tableName: collName,
                added: 0,
                removed: 0,
                modified: 0,
                schemaChanges: {
                    addedIndexes: [],
                    removedIndexes: [],
                    addedConstraints: [],
                    removedConstraints: []
                }
            };

            const collSchemaA = schemaA.get(collName) || { indexes: [] };
            const collSchemaB = schemaB.get(collName) || { indexes: [] };

            const idxA = new Set(collSchemaA.indexes?.map((i: any) => i.name));
            const idxB = new Set(collSchemaB.indexes?.map((i: any) => i.name));
            tableSummary.schemaChanges!.addedIndexes = [...idxB].filter(i => !idxA.has(i)) as string[];
            tableSummary.schemaChanges!.removedIndexes = [...idxA].filter(i => !idxB.has(i)) as string[];

            const docsA = mapA.get(collName) || {};
            const docsB = mapB.get(collName) || {};

            const allIds = new Set([...Object.keys(docsA), ...Object.keys(docsB)]);

            for (const id of allIds) {
                const docA = docsA[id];
                const docB = docsB[id];

                if (!docA && docB) {
                    tableSummary.added++;
                    result.summary.totalAdded++;
                    result.details.push({ type: 'ADDED', objectId: id, tableName: collName, after: docB });
                } else if (docA && !docB) {
                    tableSummary.removed++;
                    result.summary.totalRemoved++;
                    result.details.push({ type: 'REMOVED', objectId: id, tableName: collName, before: docA });
                } else if (!areObjectsEqual(docA, docB)) {
                    tableSummary.modified++;
                    result.summary.totalModified++;
                    result.details.push({ type: 'MODIFIED', objectId: id, tableName: collName, before: docA, after: docB });
                }
            }

            if (tableSummary.added > 0 || tableSummary.removed > 0 || tableSummary.modified > 0 ||
                tableSummary.schemaChanges!.addedIndexes.length > 0 || tableSummary.schemaChanges!.removedIndexes.length > 0) {
                result.tables.push(tableSummary);
            }
        }

        return result;
    }
}
