import { Readable } from 'stream';

export interface StorageUploadResult {
    path: string;
    size: number;
}

export interface IStorageAdapter {
    upload(key: string, stream: Readable): Promise<StorageUploadResult>;
    download(key: string): Promise<Readable>;
    delete(key: string): Promise<void>;
    getSignedUrl(key: string): Promise<string>;
}
