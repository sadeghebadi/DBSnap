import { RestoreEngine } from './restore-engine.js';
import { Readable } from 'stream';
import { LoaderFactory } from './loaders/loader.factory.js';

jest.mock('./loaders/loader.factory.js');

describe('RestoreEngine', () => {
    let engine: RestoreEngine;
    let mockStorage: any;

    beforeEach(() => {
        mockStorage = {
            download: jest.fn()
        };
        engine = new RestoreEngine(mockStorage);
    });

    it('should generate a summary from a JSONL snapshot stream', async () => {
        const jsonLines = [
            JSON.stringify({ type: 'header', metadata: { engine: 'PostgreSQL', timestamp: '2023-01-01' } }),
            JSON.stringify({ type: 'table_start', name: 'users' }),
            JSON.stringify({ type: 'row', table: 'users', data: { id: 1 } }),
            JSON.stringify({ type: 'row', table: 'users', data: { id: 2 } }),
            JSON.stringify({ type: 'table_end', name: 'users' }),
            JSON.stringify({ type: 'table_start', name: 'orders' }),
            JSON.stringify({ type: 'row', table: 'orders', data: { id: 101 } }),
            JSON.stringify({ type: 'table_end', name: 'orders' })
        ].join('\n');

        mockStorage.download.mockResolvedValue(Readable.from([jsonLines]));

        const summary = await engine.getSnapshotSummary('test.jsonl');

        expect(summary.engine).toBe('PostgreSQL');
        expect(summary.tableCounts['users']).toBe(2);
        expect(summary.tableCounts['orders']).toBe(1);
        expect(summary.totalRows).toBe(3);
    });

    it('should filter tables and use loader in applyRestore', async () => {
        const jsonLines = [
            JSON.stringify({ type: 'header', metadata: { engine: 'PostgreSQL' } }),
            JSON.stringify({ type: 'row', table: 'users', data: { id: 1 } }),
            JSON.stringify({ type: 'row', table: 'orders', data: { id: 101 } })
        ].join('\n');

        mockStorage.download.mockResolvedValue(Readable.from([jsonLines]));

        // Mock a loader
        const mockLoader = {
            connect: jest.fn().mockResolvedValue(undefined),
            prepareTable: jest.fn().mockResolvedValue(undefined),
            loadObject: jest.fn().mockResolvedValue(undefined),
            disconnect: jest.fn().mockResolvedValue(undefined)
        };

        (LoaderFactory.createLoader as jest.Mock).mockReturnValue(mockLoader);

        await engine.applyRestore('test.jsonl', 'POSTGRESQL', { host: 'localhost', port: 5432 }, {
            tables: ['users'],
            mode: 'APPEND'
        });

        expect(mockStorage.download).toHaveBeenCalledWith('test.jsonl');
        expect(mockLoader.connect).toHaveBeenCalled();
        expect(mockLoader.prepareTable).toHaveBeenCalledWith('users', 'APPEND');
        expect(mockLoader.loadObject).toHaveBeenCalledWith('users', { id: 1 });
        expect(mockLoader.prepareTable).not.toHaveBeenCalledWith('orders', expect.anything());
        expect(mockLoader.disconnect).toHaveBeenCalled();
    });
});
