import { PrismaClient } from '@prisma/client';
import { EncryptionService } from '../../apps/worker/src/encryption/encryption.service';
import { DumperFactory } from '../../apps/worker/src/dumpers/dumper.factory';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { PassThrough } from 'stream';

// Mock NestJS Logger to concise output
const consoleLogger = {
    log: (msg: string) => console.log(`[INFO] ${msg}`),
    error: (msg: string, trace?: string) => console.error(`[ERROR] ${msg}`, trace || ''),
    warn: (msg: string) => console.warn(`[WARN] ${msg}`),
};

// Polyfill Logger in services if needed (monkey patch or just rely on console)
// Since we are manually instantiating, we can't easily inject a mock logger unless we change the services to accept one via constructor properties or method injection.
// The services instantiate their own Logger via `new Logger()`. In a non-Nest context, Nest Logger usually falls back to console which is fine.

// Mock Storage Service to avoid MinIO dependency during benchmark
class MockStorageService {
    uploadStream(key: string) {
        const pass = new PassThrough();
        // Drain stream to simulate writing
        pass.resume();
        const done = new Promise<void>((resolve, reject) => {
            pass.on('end', () => resolve());
            pass.on('finish', () => resolve());
            pass.on('error', (err) => reject(err));
        });
        return { writeStream: pass, done };
    }

    async deleteObject(key: string) {
        console.log(`[MOCK] Deleted ${key}`);
    }
}

async function runBenchmark() {
    console.log('=== Starting DBSnap Benchmark Suite ===');

    // Parse Args
    const args = process.argv.slice(2);
    const size = args.find(a => a.startsWith('--size='))?.split('=')[1] || 'SMALL';
    const seed = args.includes('--seed');

    // 1. Seeding
    if (seed) {
        console.log(`[SEED] Running seed command with size: ${size}...`);
        try {
            execSync(`npx ts-node scripts/benchmark/seed.ts ${size}`, { stdio: 'inherit' });
        } catch (e) {
            console.error('Seeding failed.');
            process.exit(1);
        }
    } else {
        console.log('[SEED] Skipping seed (use --seed to enable).');
    }

    // 2. Setup Services
    // We assume .env is loaded by ts-node -r dotenv/config or preloaded ecosystem
    if (!process.env.DATABASE_URL) {
        console.error('DATABASE_URL is missing. Please check .env');
        process.exit(1);
    }

    // Manual Instantiation
    const storageService = new MockStorageService();
    const encryptionService = new EncryptionService();
    const dumperFactory = new DumperFactory();

    // 3. Benchmark Backup
    console.log(`\n[BACKUP] Starting Backup Benchmark...`);
    const dumper = dumperFactory.createDumper('Postgres');
    const { iv, stream: encryptStream } = encryptionService.createEncryptionStream();

    const key = `benchmark/backup-${Date.now()}.enc`;
    const { writeStream, done } = storageService.uploadStream(key);

    encryptStream.pipe(writeStream);

    const startTime = performance.now();
    const startMem = process.memoryUsage().heapUsed;

    try {
        const metadata = await dumper.dump(process.env.DATABASE_URL!, encryptStream);
        await done;

        const endTime = performance.now();
        const endMem = process.memoryUsage().heapUsed;

        const durationSeconds = (endTime - startTime) / 1000;
        const memDiffMB = (endMem - startMem) / 1024 / 1024;

        console.log(`[BACKUP] Completed in ${durationSeconds.toFixed(2)}s`);
        console.log(`[BACKUP] Rows Processed: ${metadata.totalRows}`);
        console.log(`[BACKUP] Memory Delta: ${memDiffMB.toFixed(2)} MB`);

        // Report
        const report = {
            timestamp: new Date().toISOString(),
            size,
            backup: {
                durationSeconds,
                totalRows: metadata.totalRows,
                memoryDeltaMB: memDiffMB
            }
        };

        fs.writeFileSync('benchmark_results.json', JSON.stringify(report, null, 2));
        console.log('[REPORT] Saved to benchmark_results.json');

        // Cleanup
        console.log(`[CLEANUP] Deleting ${key}...`);
        await storageService.deleteObject(key);

    } catch (e: any) {
        console.error('[BACKUP] Benchmark Failed:', e);
        process.exit(1);
    }

    console.log('=== Benchmark Complete ===');
}

runBenchmark();
