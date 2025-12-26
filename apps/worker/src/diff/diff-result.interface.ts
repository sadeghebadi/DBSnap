export type ChangeType = 'ADDED' | 'REMOVED' | 'MODIFIED';

export interface DiffDetail {
    type: ChangeType;
    objectId: string; // PK for SQL, _id for Mongo
    tableName: string;
    before?: any;
    after?: any;
}

export interface TableDiffSummary {
    tableName: string;
    added: number;
    removed: number;
    modified: number;
    schemaChanges?: {
        addedIndexes: string[];
        removedIndexes: string[];
        addedConstraints: string[];
        removedConstraints: string[];
    };
}

export interface DiffResult {
    snapshotA: string; // Storage Key
    snapshotB: string; // Storage Key
    timestamp: string;
    summary: {
        totalAdded: number;
        totalRemoved: number;
        totalModified: number;
    };
    tables: TableDiffSummary[];
    details: DiffDetail[];
}
