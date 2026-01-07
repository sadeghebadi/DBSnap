import { Readable } from 'stream';
import { MongoDiffEngine } from './mongo-diff';

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

describe('MongoDiffEngine', () => {
    let engine: MongoDiffEngine;

    beforeEach(() => {
        engine = new MongoDiffEngine();
    });

    it('should detect no changes for identical streams', async () => {
        const docs = [{ _id: '1', val: 'a' }, { _id: '2', val: 'b' }];
        const result = await engine.compare(createStream(docs), createStream(docs));
        expect(result).toEqual({ added: 0, removed: 0, modified: 0 });
    });

    it('should detect added documents', async () => {
        const docsA = [{ _id: '1', val: 'a' }];
        const docsB = [{ _id: '1', val: 'a' }, { _id: '2', val: 'b' }];
        const result = await engine.compare(createStream(docsA), createStream(docsB));
        expect(result).toEqual({ added: 1, removed: 0, modified: 0 });
    });

    it('should detect removed documents', async () => {
        const docsA = [{ _id: '1', val: 'a' }, { _id: '2', val: 'b' }];
        const docsB = [{ _id: '1', val: 'a' }];
        const result = await engine.compare(createStream(docsA), createStream(docsB));
        expect(result).toEqual({ added: 0, removed: 1, modified: 0 });
    });

    it('should detect modified documents', async () => {
        const docsA = [{ _id: '1', val: 'a' }];
        const docsB = [{ _id: '1', val: 'changed' }];
        const result = await engine.compare(createStream(docsA), createStream(docsB));
        expect(result).toEqual({ added: 0, removed: 0, modified: 1 });
    });

    it('should detect complex changes', async () => {
        const docsA = [{ _id: '1', val: 'a' }, { _id: '2', val: 'b' }, { _id: '3', val: 'c' }];
        const docsB = [{ _id: '1', val: 'a' }, { _id: '3', val: 'changed' }, { _id: '4', val: 'd' }];
        // 2 removed (b), 3 modified, 4 added
        const result = await engine.compare(createStream(docsA), createStream(docsB));
        expect(result).toEqual({ added: 1, removed: 1, modified: 1 });
    });
});
