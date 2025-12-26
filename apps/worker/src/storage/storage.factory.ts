import { IStorageAdapter } from './storage-adapter.interface.js';
import { LocalStorageAdapter } from './local-storage.adapter.js';
import { S3StorageAdapter, S3Config } from './s3-storage.adapter.js';

export type StorageDriver = 'local' | 's3';

export interface StorageOptions {
    driver: StorageDriver;
    local?: {
        baseDir: string;
    };
    s3?: S3Config;
}

export class StorageFactory {
    static createAdapter(options: StorageOptions): IStorageAdapter {
        switch (options.driver) {
            case 'local':
                return new LocalStorageAdapter(options.local?.baseDir);
            case 's3':
                if (!options.s3) {
                    throw new Error('S3 configuration is missing for S3 driver');
                }
                return new S3StorageAdapter(options.s3);
            default:
                throw new Error(`Unsupported storage driver: ${options.driver}`);
        }
    }
}
