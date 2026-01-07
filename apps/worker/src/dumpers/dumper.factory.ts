import { DbType } from '@dbsnap/database';
import { IDumper } from './dumper.interface';
import { PostgresDumper } from './postgres.dumper';
import { MongoDumper } from './mongo.dumper';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DumperFactory {
    createDumper(type: DbType): IDumper {
        switch (type) {
            case 'Postgres':
                return new PostgresDumper();
            case 'MongoDB':
                return new MongoDumper();
            default:
                throw new Error(`Unsupported database type: ${type}`);
        }
    }
}
