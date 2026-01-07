
import { S3Client, CreateBucketCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { Readable, Transform } from 'stream';
import crypto from 'crypto';

// Configuration
const TARGET_SIZE_MB = 1024; // 1GB (Change to 10240 for 10GB test)
const CHUNK_SIZE = 64 * 1024; // 64KB chunks
const S3_CONFIG = {
    endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
    region: process.env.S3_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY || 'admin',
        secretAccessKey: process.env.S3_SECRET_KEY || 'password',
    },
    forcePathStyle: true,
};
const BUCKET = process.env.S3_BUCKET || 'dbsnap-backups';
const KEY = `benchmark-load-test-${Date.now()}.bin`;

// 1. Data Generator Stream
class RandomStream extends Readable {
    private generated = 0;
    private totalSize = TARGET_SIZE_MB * 1024 * 1024;

    _read(size: number) {
        if (this.generated >= this.totalSize) {
            this.push(null);
            return;
        }
        const chunkSize = Math.min(size, this.totalSize - this.generated);
        const chunk = crypto.randomBytes(chunkSize);
        this.generated += chunkSize;
        this.push(chunk);
    }
}

// 2. Encryption Stream (Simulation)
const algorithm = 'aes-256-gcm';
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);
const cipher = crypto.createCipheriv(algorithm, key, iv);

// 3. Monitor Stream
let maxHeapUsed = 0;
const monitor = new Transform({
    transform(chunk, encoding, callback) {
        const mem = process.memoryUsage();
        if (mem.heapUsed > maxHeapUsed) maxHeapUsed = mem.heapUsed;

        callback(null, chunk);
    }
});

async function runBenchmark() {
    console.log(`🚀 Starting Load Test: ${TARGET_SIZE_MB}MB to ${BUCKET}/${KEY}`);
    console.log(`Using Endpoint: ${S3_CONFIG.endpoint}`);

    const client = new S3Client(S3_CONFIG);

    try {
        await client.send(new CreateBucketCommand({ Bucket: BUCKET }));
    } catch (e) {
        // Ignore if exists
    }

    const dataStream = new RandomStream({ highWaterMark: CHUNK_SIZE });

    // Pipeline: Gen -> Monitor -> Encrypt -> Upload
    const uploadStream = dataStream.pipe(monitor).pipe(cipher);

    const upload = new Upload({
        client,
        params: {
            Bucket: BUCKET,
            Key: KEY,
            Body: uploadStream,
        },
        queueSize: 4, // Concurrency
        partSize: 5 * 1024 * 1024, // 5MB parts
    });

    upload.on('httpUploadProgress', (progress) => {
        const loadedMB = (progress.loaded || 0) / 1024 / 1024;
        const heapMB = process.memoryUsage().heapUsed / 1024 / 1024;
        process.stdout.write(`\r📤 Uploaded: ${loadedMB.toFixed(2)} MB | Heap: ${heapMB.toFixed(2)} MB (Max: ${(maxHeapUsed / 1024 / 1024).toFixed(2)} MB)`);
    });

    const start = Date.now();
    await upload.done();
    const duration = (Date.now() - start) / 1000;

    console.log('\n\n✅ Benchmark Complete!');
    console.log(`Time: ${duration.toFixed(2)}s`);
    console.log(`Speed: ${(TARGET_SIZE_MB / duration).toFixed(2)} MB/s`);
    console.log(`Max Heap Used: ${(maxHeapUsed / 1024 / 1024).toFixed(2)} MB`);

    if (maxHeapUsed > 512 * 1024 * 1024) {
        console.error('❌ FAIL: Memory limit exceeded 512MB');
        process.exit(1);
    } else {
        console.log('✅ PASS: Memory usage within limits (Streaming CONFIRMED)');
        process.exit(0);
    }
}

runBenchmark().catch(err => {
    console.error('\n❌ Benchmark Error:', err);
    process.exit(1);
});
