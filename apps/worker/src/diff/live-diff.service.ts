import { SnapshotEngine, DatabaseType } from '../snapshots/snapshot-engine.js';
import { MongoDiffEngine } from './mongo-diff.engine.js';
import { SqlDiffEngine } from './sql-diff.engine.js';
import { DiffResult } from './diff-result.interface.js';
import { IStorageAdapter } from '../storage/storage-adapter.interface.js';
import { ExtractorOptions } from '../snapshots/extractors/base.extractor.js';

export class LiveDiffService {
    private snapshotEngine = new SnapshotEngine();

    constructor(private storage: IStorageAdapter) { }

    async compareLive(
        type: DatabaseType,
        connectionOptions: ExtractorOptions,
        snapshotKey: string
    ): Promise<DiffResult> {
        // 1. Get live stream from extractor
        const { stream: liveStream } = await this.snapshotEngine.createSnapshotStream(type, connectionOptions);

        // 2. Select appropriate diff engine
        let engine;
        if (type === DatabaseType.MONGODB) {
            engine = new MongoDiffEngine(this.storage);
        } else {
            engine = new SqlDiffEngine(this.storage);
        }

        // 3. Compare live stream vs snapshot key
        const snapshotIter = (engine as any).getSnapshotIterator(snapshotKey);

        return engine.compareIterators(snapshotIter, liveStream, snapshotKey, 'LIVE');
    }
}
