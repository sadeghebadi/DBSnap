import { SnapshotEngine, DatabaseType } from './snapshot-engine.js';
import { Readable } from 'stream';

// Mocking extractors to avoid real DB connections in unit tests
jest.mock('./extractors/postgres.extractor.js', () => ({
    PostgresExtractor: jest.fn().mockImplementation(() => ({
        extract: jest.fn().mockResolvedValue({
            stream: Readable.from([
                JSON.stringify({ type: 'header', metadata: { engine: 'PostgreSQL' } }) + '\n',
                JSON.stringify({ type: 'row', data: { id: 1 } }) + '\n'
            ]),
            metadata: { engine: 'PostgreSQL', tables: ['test'] }
        })
    }))
}));

describe('SnapshotEngine', () => {
    let engine: SnapshotEngine;

    beforeEach(() => {
        engine = new SnapshotEngine();
    });

    it('should create a PostgreSQL snapshot stream', async () => {
        const result = await engine.createSnapshotStream(DatabaseType.POSTGRESQL, {
            host: 'localhost',
            port: 5432,
        });

        expect(result.metadata.engine).toBe('PostgreSQL');

        const chunks = [];
        for await (const chunk of result.stream) {
            chunks.push(chunk.toString());
        }

        const lines = chunks.join('').split('\n').filter(Boolean);
        expect(lines.length).toBe(2);
        expect(JSON.parse(lines[0]).type).toBe('header');
        expect(JSON.parse(lines[1]).data.id).toBe(1);
    });

    it('should throw error for unsupported database type', async () => {
        await expect(engine.createSnapshotStream('INVALID' as any, { host: 'l', port: 1 }))
            .rejects.toThrow('Unsupported database type: INVALID');
    });
});
