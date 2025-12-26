import { IDiffEngine } from './diff-engine.interface.js';
import { DiffResult } from './diff-result.interface.js';
import { IStorageAdapter } from '../storage/storage-adapter.interface.js';
import { createInterface } from 'readline';
import { Readable } from 'stream';

export abstract class DiffEngine implements IDiffEngine {
    constructor(protected storage: IStorageAdapter) { }

    async compare(snapshotAKey: string, snapshotBKey: string): Promise<DiffResult> {
        const iterA = this.getSnapshotIterator(snapshotAKey);
        const iterB = this.getSnapshotIterator(snapshotBKey);
        return this.compareIterators(iterA, iterB, snapshotAKey, snapshotBKey);
    }

    protected abstract compareIterators(
        iterA: AsyncIterable<any>,
        iterB: AsyncIterable<any>,
        keyA: string,
        keyB: string
    ): Promise<DiffResult>;

    async saveResult(result: DiffResult): Promise<string> {
        const key = `diffs/${result.snapshotA}-${result.snapshotB}.json`;
        const content = JSON.stringify(result, null, 2);
        const stream = Readable.from([content]);

        await this.storage.upload(key, stream);
        return key;
    }

    protected async *getSnapshotIterator(key: string) {
        const stream = await this.storage.download(key);
        const rl = createInterface({ input: stream, terminal: false });
        for await (const line of rl) {
            if (line.trim()) {
                yield JSON.parse(line);
            }
        }
    }
}
