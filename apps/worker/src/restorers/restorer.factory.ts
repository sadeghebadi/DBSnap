import { Injectable } from '@nestjs/common';
import { DbType } from '@dbsnap/database';
import { IRestorer } from './restorer.interface';
import { PostgresRestorer } from './postgres.restorer';
import { MongoRestorer } from './mongo.restorer';

@Injectable()
export class RestorerFactory {
    createRestorer(type: DbType): IRestorer {
        switch (type) {
            case 'Postgres':
                return new PostgresRestorer();
            case 'MongoDB':
                return new MongoRestorer();
            default:
                throw new Error(`Unsupported database type: ${type}`);
        }
    }
}
