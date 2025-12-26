import { IDatabaseExtractor, ExtractorOptions } from './extractors/base.extractor.js';
import { PostgresExtractor } from './extractors/postgres.extractor.js';
import { MySqlExtractor } from './extractors/mysql.extractor.js';
import { MongoExtractor } from './extractors/mongo.extractor.js';

export enum DatabaseType {
    POSTGRESQL = 'POSTGRESQL',
    MYSQL = 'MYSQL',
    MONGODB = 'MONGODB',
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

    async createSnapshotStream(type: DatabaseType, options: ExtractorOptions) {
        const extractor = this.extractors[type];
        if (!extractor) {
            throw new Error(`Unsupported database type: ${type}`);
        }

        return extractor.extract(options);
    }
}
