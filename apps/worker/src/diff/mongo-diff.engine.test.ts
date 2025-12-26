import { MongoDiffEngine } from './mongo-diff.engine.js';
import { Readable } from 'stream';

describe('MongoDiffEngine', () => {
    let engine: MongoDiffEngine;
    let mockStorage: any;

    beforeEach(() => {
        mockStorage = {
            download: jest.fn()
        };
        engine = new MongoDiffEngine(mockStorage);
    });

    it('should detect added, removed, and modified documents', async () => {
        const snapA = [
            JSON.stringify({ type: 'header', metadata: { engine: 'MongoDB' } }),
            JSON.stringify({ type: 'document', collection: 'users', data: { _id: '1', name: 'Alice' } }),
            JSON.stringify({ type: 'document', collection: 'users', data: { _id: '2', name: 'Bob' } }),
        ].join('\n');

        const snapB = [
            JSON.stringify({ type: 'header', metadata: { engine: 'MongoDB' } }),
            JSON.stringify({ type: 'document', collection: 'users', data: { _id: '2', name: 'Robert' } }), // Modified
            JSON.stringify({ type: 'document', collection: 'users', data: { _id: '3', name: 'Charlie' } }), // Added
            // Alice is Removed
        ].join('\n');

        mockStorage.download
            .mockResolvedValueOnce(Readable.from([snapA]))
            .mockResolvedValueOnce(Readable.from([snapB]));

        const result = await engine.compare('snapA', 'snapB');

        expect(result.summary.totalAdded).toBe(1);
        expect(result.summary.totalRemoved).toBe(1);
        expect(result.summary.totalModified).toBe(1);

        const usersSummary = result.tables.find(t => t.tableName === 'users');
        expect(usersSummary).toBeDefined();
        expect(usersSummary?.added).toBe(1);
        expect(usersSummary?.removed).toBe(1);
        expect(usersSummary?.modified).toBe(1);

        expect(result.details.some(d => d.type === 'ADDED' && d.objectId === '3')).toBe(true);
        expect(result.details.some(d => d.type === 'REMOVED' && d.objectId === '1')).toBe(true);
        expect(result.details.some(d => d.type === 'MODIFIED' && d.objectId === '2')).toBe(true);
    });
});
