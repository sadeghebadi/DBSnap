import { DiffResult } from './diff-result.interface.js';

export interface IDiffEngine {
    compare(snapshotAKey: string, snapshotBKey: string): Promise<DiffResult>;
}
