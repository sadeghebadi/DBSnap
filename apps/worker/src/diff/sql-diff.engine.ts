import { DiffEngine } from './diff-engine.service.js';
import { DiffResult, TableDiffSummary } from './diff-result.interface.js';
import { areObjectsEqual } from './utils/object-diff.utils.js';

export class SqlDiffEngine extends DiffEngine {
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

        const tableSchemasA = new Map<string, any>();
        const tableSchemasB = new Map<string, any>();
        const tableMapsA = new Map<string, Map<string, any>>();
        const tableMapsB = new Map<string, Map<string, any>>();

        for await (const entry of iterA) {
            if (entry.type === 'table_start') {
                tableSchemasA.set(entry.name, entry.schema);
            } else if (entry.type === 'row') {
                const tableName = entry.table;
                if (!tableMapsA.has(tableName)) tableMapsA.set(tableName, new Map());
                const key = this.getRowKey(entry.data);
                tableMapsA.get(tableName)!.set(key, entry.data);
            }
        }

        for await (const entry of iterB) {
            if (entry.type === 'table_start') {
                tableSchemasB.set(entry.name, entry.schema);
            } else if (entry.type === 'row') {
                const tableName = entry.table;
                if (!tableMapsB.has(tableName)) tableMapsB.set(tableName, new Map());
                const key = this.getRowKey(entry.data);
                tableMapsB.get(tableName)!.set(key, entry.data);
            }
        }

        const allTables = new Set([...tableMapsA.keys(), ...tableMapsB.keys(), ...tableSchemasA.keys(), ...tableSchemasB.keys()]);

        for (const tableName of allTables) {
            const summary: TableDiffSummary = {
                tableName,
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

            const schemaA = tableSchemasA.get(tableName) || { indexes: [], constraints: [] };
            const schemaB = tableSchemasB.get(tableName) || { indexes: [], constraints: [] };

            // Compare indexes
            const idxA = new Set(schemaA.indexes?.map((i: any) => i.indexname));
            const idxB = new Set(schemaB.indexes?.map((i: any) => i.indexname));
            summary.schemaChanges!.addedIndexes = [...idxB].filter(i => !idxA.has(i)) as string[];
            summary.schemaChanges!.removedIndexes = [...idxA].filter(i => !idxB.has(i)) as string[];

            // Compare constraints
            const consA = new Set(schemaA.constraints?.map((c: any) => c.conname));
            const consB = new Set(schemaB.constraints?.map((c: any) => c.conname));
            summary.schemaChanges!.addedConstraints = [...consB].filter(c => !consA.has(c)) as string[];
            summary.schemaChanges!.removedConstraints = [...consA].filter(c => !consB.has(c)) as string[];

            const rowsA = tableMapsA.get(tableName) || new Map();
            const rowsB = tableMapsB.get(tableName) || new Map();

            const allKeys = new Set([...rowsA.keys(), ...rowsB.keys()]);

            for (const key of allKeys) {
                const rowA = rowsA.get(key);
                const rowB = rowsB.get(key);

                if (!rowA && rowB) {
                    summary.added++;
                    result.summary.totalAdded++;
                    result.details.push({ type: 'ADDED', objectId: key, tableName, after: rowB });
                } else if (rowA && !rowB) {
                    summary.removed++;
                    result.summary.totalRemoved++;
                    result.details.push({ type: 'REMOVED', objectId: key, tableName, before: rowA });
                } else if (!areObjectsEqual(rowA, rowB)) {
                    summary.modified++;
                    result.summary.totalModified++;
                    result.details.push({ type: 'MODIFIED', objectId: key, tableName, before: rowA, after: rowB });
                }
            }

            if (summary.added > 0 || summary.removed > 0 || summary.modified > 0 ||
                summary.schemaChanges!.addedIndexes.length > 0 || summary.schemaChanges!.removedIndexes.length > 0 ||
                summary.schemaChanges!.addedConstraints.length > 0 || summary.schemaChanges!.removedConstraints.length > 0) {
                result.tables.push(summary);
            }
        }

        return result;
    }

    private getRowKey(data: any): string {
        if (data.id !== undefined) return String(data.id);
        if (data.uuid !== undefined) return String(data.uuid);
        if (data.ID !== undefined) return String(data.ID);
        return JSON.stringify(data);
    }
}
