import { Readable } from 'stream';
import { SqlDiffEngine } from './sql-diff.engine.js';

describe('DiffEngine Interface', () => {
    let engine: SqlDiffEngine;
    let mockStorage: any;

    beforeEach(() => {
        const emptySnapshot = JSON.stringify({ type: 'header', metadata: {} }) + '\n';
        mockStorage = {
            download: jest.fn().mockImplementation(() => Promise.resolve(Readable.from([emptySnapshot]))),
            upload: jest.fn().mockResolvedValue(undefined)
        };
        engine = new SqlDiffEngine(mockStorage);
    });

    it('should return a valid DiffResult structure', async () => {
        const result = await engine.compare('snap1', 'snap2');

        expect(result.snapshotA).toBe('snap1');
        expect(result.snapshotB).toBe('snap2');
        expect(result.summary).toBeDefined();
        expect(Array.isArray(result.tables)).toBe(true);
        expect(Array.isArray(result.details)).toBe(true);
    });
});
