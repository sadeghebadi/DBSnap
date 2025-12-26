import { IDatabaseExtractor, ExtractorOptions } from './extractors/base.extractor.js';
import { PostgresExtractor } from './extractors/postgres.extractor.js';
import { MySqlExtractor } from './extractors/mysql.extractor.js';
import { MongoExtractor } from './extractors/mongo.extractor.js';
import { createCompressionStream, createHashingStream, HashTransform } from '../utils/stream-utils.js';

export enum DatabaseType {
    POSTGRESQL = 'POSTGRESQL',
    MYSQL = 'MYSQL',
    MONGODB = 'MONGODB',
}

export interface SnapshotResult {
    stream: any;
    metadata: any;
    hashStream: HashTransform;
}

export class SnapshotEngine {
    private extractors: Record<DatabaseType, IDatabaseExtractor>;

    constructor() {
        this.extractors = {
            [DatabaseType.POSTGRESQL]: new PostgresExtractor(),
            [DatabaseType.MYSQL]: new MySqlExtractor(),
            [DatabaseType.MONGODB]: new MongoExtractor(),
        };
    }

    async createSnapshotStream(type: DatabaseType, options: ExtractorOptions, compress = false): Promise<SnapshotResult> {
        const extractor = this.extractors[type];
        if (!extractor) {
            throw new Error(`Unsupported database type: ${type}`);
        }

        const { stream, metadata } = await extractor.extract(options);

        let processedStream = stream;
        if (compress) {
            processedStream = processedStream.pipe(createCompressionStream());
        }

        const hashStream = createHashingStream();
        processedStream = processedStream.pipe(hashStream);

        return { stream: processedStream, metadata, hashStream };
    }
}
