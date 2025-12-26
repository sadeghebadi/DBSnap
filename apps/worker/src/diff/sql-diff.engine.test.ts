import { SqlDiffEngine } from './sql-diff.engine.js';
import { Readable } from 'stream';

describe('SqlDiffEngine', () => {
    let engine: SqlDiffEngine;
    let mockStorage: any;

    beforeEach(() => {
        mockStorage = {
            download: jest.fn()
        };
        engine = new SqlDiffEngine(mockStorage);
    });

    it('should detect row changes in SQL tables', async () => {
        const snapA = [
            JSON.stringify({ type: 'header', metadata: { engine: 'PostgreSQL' } }),
            JSON.stringify({ type: 'row', table: 'products', data: { id: 1, name: 'Phone', price: 500 } }),
            JSON.stringify({ type: 'row', table: 'products', data: { id: 2, name: 'Laptop', price: 1000 } }),
        ].join('\n');

        const snapB = [
            JSON.stringify({ type: 'header', metadata: { engine: 'PostgreSQL' } }),
            JSON.stringify({ type: 'row', table: 'products', data: { id: 2, name: 'Laptop Pro', price: 1200 } }), // Modified
            JSON.stringify({ type: 'row', table: 'products', data: { id: 3, name: 'Tablet', price: 300 } }),    // Added
            // Phone (id: 1) is Removed
        ].join('\n');

        mockStorage.download
            .mockResolvedValueOnce(Readable.from([snapA]))
            .mockResolvedValueOnce(Readable.from([snapB]));

        const result = await engine.compare('snapA', 'snapB');

        expect(result.summary.totalAdded).toBe(1);
        expect(result.summary.totalRemoved).toBe(1);
        expect(result.summary.totalModified).toBe(1);

        const tableSummary = result.tables.find(t => t.tableName === 'products');
        expect(tableSummary?.added).toBe(1);
        expect(tableSummary?.removed).toBe(1);
        expect(tableSummary?.modified).toBe(1);

        expect(result.details.some(d => d.type === 'MODIFIED' && d.objectId === '2')).toBe(true);
    });
});
