import { Readable } from 'stream';
import { S3Client, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Upload } from '@aws-sdk/lib-storage';
import { IStorageAdapter, StorageUploadResult } from './storage-adapter.interface.js';

export interface S3Config {
    bucket: string;
    region: string;
    endpoint?: string;
    credentials: {
        accessKeyId: string;
        secretAccessKey: string;
    };
    forcePathStyle?: boolean;
}

export class S3StorageAdapter implements IStorageAdapter {
    private client: S3Client;
    private bucket: string;

    constructor(config: S3Config) {
        this.client = new S3Client({
            region: config.region,
            endpoint: config.endpoint,
            credentials: config.credentials,
            forcePathStyle: config.forcePathStyle,
        });
        this.bucket = config.bucket;
    }

    async upload(key: string, stream: Readable): Promise<StorageUploadResult> {
        const upload = new Upload({
            client: this.client,
            params: {
                Bucket: this.bucket,
                Key: key,
                Body: stream,
            },
        });

        // Track size
        let size = 0;
        stream.on('data', (chunk) => {
            size += chunk.length;
        });

        await upload.done();

        return {
            path: `s3://${this.bucket}/${key}`,
            size,
        };
    }

    async download(key: string): Promise<Readable> {
        const command = new GetObjectCommand({
            Bucket: this.bucket,
            Key: key,
        });

        const response = await this.client.send(command);
        return response.Body as Readable;
    }

    async delete(key: string): Promise<void> {
        const command = new DeleteObjectCommand({
            Bucket: this.bucket,
            Key: key,
        });

        await this.client.send(command);
    }

    async getSignedUrl(key: string): Promise<string> {
        const command = new GetObjectCommand({
            Bucket: this.bucket,
            Key: key,
        });

        return getSignedUrl(this.client, command, { expiresIn: 3600 });
    }
}
