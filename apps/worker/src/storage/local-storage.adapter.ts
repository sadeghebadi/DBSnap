import { Readable } from 'stream';
import { createWriteStream, createReadStream, promises as fs } from 'fs';
import { join, dirname } from 'path';
import { IStorageAdapter, StorageUploadResult } from './storage-adapter.interface.js';

export class LocalStorageAdapter implements IStorageAdapter {
    private baseDir: string;

    constructor(baseDir: string = './storage/snapshots') {
        this.baseDir = baseDir;
    }

    async upload(key: string, stream: Readable): Promise<StorageUploadResult> {
        const fullPath = join(this.baseDir, key);
        await fs.mkdir(dirname(fullPath), { recursive: true });

        const writeStream = createWriteStream(fullPath);
        let size = 0;

        return new Promise((resolve, reject) => {
            stream.on('data', (chunk) => {
                size += chunk.length;
            });

            stream.pipe(writeStream);

            writeStream.on('finish', () => {
                resolve({ path: fullPath, size });
            });

            writeStream.on('error', (err) => {
                reject(err);
            });

            stream.on('error', (err) => {
                writeStream.destroy();
                reject(err);
            });
        });
    }

    async download(key: string): Promise<Readable> {
        const fullPath = join(this.baseDir, key);
        return createReadStream(fullPath);
    }

    async delete(key: string): Promise<void> {
        const fullPath = join(this.baseDir, key);
        await fs.unlink(fullPath);
    }

    async getSignedUrl(key: string): Promise<string> {
        return `file://${join(process.cwd(), this.baseDir, key)}`;
    }
}
