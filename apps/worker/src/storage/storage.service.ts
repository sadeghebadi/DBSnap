import { Injectable, Logger } from '@nestjs/common';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { PassThrough, Readable } from 'stream';

@Injectable()
export class StorageService {
    private s3Client: S3Client;
    private bucketName: string;
    private readonly logger = new Logger(StorageService.name);

    constructor() {
        this.bucketName = process.env.S3_BUCKET_NAME || 'dbsnap-backups';
        const region = process.env.S3_REGION || 'us-east-1';
        const endpoint = process.env.S3_ENDPOINT; // Optional, for MinIO

        this.s3Client = new S3Client({
            region,
            endpoint,
            forcePathStyle: true, // Needed for MinIO
            credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY || 'minioadmin',
                secretAccessKey: process.env.S3_SECRET_KEY || 'minioadmin',
            },
        });
    }

    /**
     * Returns a writable stream that pipes data to S3.
     * The promise resolves when the upload is complete.
     */
    uploadStream(key: string): { writeStream: PassThrough; done: Promise<void> } {
        const pass = new PassThrough();

        const upload = new Upload({
            client: this.s3Client,
            params: {
                Bucket: this.bucketName,
                Key: key,
                Body: pass,
                ContentType: 'application/x-jsonl'
            },
        });

        const done = upload.done().then(() => {
            this.logger.log(`Upload complete: ${key}`);
        }).catch((err) => {
            this.logger.error(`Upload failed for ${key}: ${err.message}`);
            throw err;
        });

        return { writeStream: pass, done: done as Promise<void> };
    }

    async downloadStream(key: string): Promise<Readable> {
        const command = new GetObjectCommand({
            Bucket: this.bucketName,
            Key: key,
        });

        const response = await this.s3Client.send(command);
        return response.Body as Readable;
    }
}
