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
    sshEnabled?: boolean;
    sshHost?: string;
    sshPort?: number;
    sshUsername?: string;
    sshPrivateKey?: string;
    sshPassphrase?: string;
    proxyEnabled?: boolean;
    proxyHost?: string;
    proxyPort?: number;
    proxyType?: string;
    proxyUsername?: string;
    proxyPassword?: string;
    sslEnabled?: boolean;
    sslCA?: string;
    sslCert?: string;
    sslKey?: string;
}
