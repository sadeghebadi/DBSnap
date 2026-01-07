import { Readable } from 'stream';
import { SqlDiffEngine } from './sql-diff';

function createStream(docs: any[]): Readable {
    const stream = new Readable({
        read() { }
    });
    docs.forEach(doc => {
        stream.push(JSON.stringify({ type: 'data', collection: 'test', doc }) + '\n');
    });
    stream.push(null);
    return stream;
}

describe('SqlDiffEngine', () => {
    let engine: SqlDiffEngine;

    beforeEach(() => {
        engine = new SqlDiffEngine();
    });

    it('should detect no changes for identical streams', async () => {
        const docs = [{ id: 1, val: 'a' }, { id: 2, val: 'b' }];
        const result = await engine.compare(createStream(docs), createStream(docs), { primaryKey: 'id' });
        expect(result).toEqual({ added: 0, removed: 0, modified: 0 });
    });

    it('should detect added rows (tail)', async () => {
        const docsA = [{ id: 1, val: 'a' }];
        const docsB = [{ id: 1, val: 'a' }, { id: 2, val: 'b' }];
        const result = await engine.compare(createStream(docsA), createStream(docsB), { primaryKey: 'id' });
        expect(result).toEqual({ added: 1, removed: 0, modified: 0 });
    });

    it('should detect removed rows (tail)', async () => {
        const docsA = [{ id: 1, val: 'a' }, { id: 2, val: 'b' }];
        const docsB = [{ id: 1, val: 'a' }];
        const result = await engine.compare(createStream(docsA), createStream(docsB), { primaryKey: 'id' });
        expect(result).toEqual({ added: 0, removed: 1, modified: 0 });
    });

    it('should detect added rows (head)', async () => {
        const docsA = [{ id: 2, val: 'b' }];
        const docsB = [{ id: 1, val: 'a' }, { id: 2, val: 'b' }];
        const result = await engine.compare(createStream(docsA), createStream(docsB), { primaryKey: 'id' });
        expect(result).toEqual({ added: 1, removed: 0, modified: 0 });
    });

    it('should detect removed rows (head)', async () => {
        const docsA = [{ id: 1, val: 'a' }, { id: 2, val: 'b' }];
        const docsB = [{ id: 2, val: 'b' }];
        const result = await engine.compare(createStream(docsA), createStream(docsB), { primaryKey: 'id' });
        expect(result).toEqual({ added: 0, removed: 1, modified: 0 });
    });

    it('should detect interleaved changes', async () => {
        // A: 1, 3, 5
        // B: 1, 2, 5 (modified)
        // Result: 3 removed, 2 added, 5 modified.
        const docsA = [{ id: 1, val: 'a' }, { id: 3, val: 'c' }, { id: 5, val: 'e' }];
        const docsB = [{ id: 1, val: 'a' }, { id: 2, val: 'b' }, { id: 5, val: 'ex' }];
        const result = await engine.compare(createStream(docsA), createStream(docsB), { primaryKey: 'id' });
        expect(result).toEqual({ added: 1, removed: 1, modified: 1 });
    });

    it('should work with string PKs', async () => {
        const docsA = [{ uuid: 'a', val: 1 }, { uuid: 'c', val: 3 }];
        const docsB = [{ uuid: 'a', val: 1 }, { uuid: 'b', val: 2 }, { uuid: 'c', val: 33 }];
        // Added 'b' (middle), Modified 'c'.
        const result = await engine.compare(createStream(docsA), createStream(docsB), { primaryKey: 'uuid' });
        expect(result).toEqual({ added: 1, removed: 0, modified: 1 });
    });
});
