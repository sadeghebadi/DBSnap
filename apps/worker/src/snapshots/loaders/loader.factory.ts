import { IDatabaseLoader } from './base.loader.js';
import { PostgresLoader } from './postgres.loader.js';

export class LoaderFactory {
    static createLoader(type: 'POSTGRESQL' | 'MYSQL' | 'MONGODB'): IDatabaseLoader {
        switch (type) {
            case 'POSTGRESQL':
                return new PostgresLoader();
            default:
                throw new Error(`Restore loader not implemented for: ${type}`);
        }
    }
}
