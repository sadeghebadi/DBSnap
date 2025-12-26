import { LocalStorageAdapter } from './local-storage.adapter.js';
import { Readable } from 'stream';
import { promises as fs } from 'fs';
import { join } from 'path';

describe('LocalStorageAdapter', () => {
    const testDir = './test-storage';
    let adapter: LocalStorageAdapter;

    beforeEach(async () => {
        adapter = new LocalStorageAdapter(testDir);
        await fs.mkdir(testDir, { recursive: true });
    });

    afterEach(async () => {
        await fs.rm(testDir, { recursive: true, force: true });
    });

    it('should upload a stream to local file system', async () => {
        const key = 'test-snapshot.jsonl';
        const content = '{"test": "data"}\n';
        const stream = Readable.from([content]);

        const result = await adapter.upload(key, stream);

        expect(result.path).toContain(key);
        expect(result.size).toBe(content.length);

        const fileContent = await fs.readFile(result.path, 'utf-8');
        expect(fileContent).toBe(content);
    });

    it('should delete a file from local file system', async () => {
        const key = 'delete-me.txt';
        const fullPath = join(testDir, key);
        await fs.writeFile(fullPath, 'junk');

        await adapter.delete(key);

        await expect(fs.access(fullPath)).rejects.toThrow();
    });
});
