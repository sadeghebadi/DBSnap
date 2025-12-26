import { PartialType } from '@nestjs/mapped-types';
import { CreateConnectionDto, DatabaseType } from './create-connection.dto.js';

export class UpdateConnectionDto extends PartialType(CreateConnectionDto) {
    name?: string;
    type?: DatabaseType;
    host?: string;
    port?: number;
    databaseName?: string;
    username?: string;
    password?: string;
    projectId?: string;
}
