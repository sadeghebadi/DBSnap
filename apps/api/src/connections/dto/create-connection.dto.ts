import { IsString, IsInt, IsEnum, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export enum DatabaseType {
    POSTGRESQL = 'POSTGRESQL',
    MYSQL = 'MYSQL',
    MONGODB = 'MONGODB',
}

export class CreateConnectionDto {
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsEnum(DatabaseType)
    type!: DatabaseType;

    @IsString()
    @IsNotEmpty()
    host!: string;

    @IsInt()
    port!: number;

    @IsString()
    @IsNotEmpty()
    databaseName!: string;

    @IsString()
    @IsNotEmpty()
    username!: string;

    @IsString()
    @IsNotEmpty()
    password!: string;

    @IsString()
    @IsNotEmpty()
    projectId!: string;

    @IsOptional()
    @IsBoolean()
    sshEnabled?: boolean;

    @IsOptional()
    @IsString()
    sshHost?: string;

    @IsOptional()
    @IsInt()
    sshPort?: number;

    @IsOptional()
    @IsString()
    sshUsername?: string;

    @IsOptional()
    @IsString()
    sshPrivateKey?: string;

    @IsOptional()
    @IsString()
    sshPassphrase?: string;

    @IsOptional()
    @IsBoolean()
    proxyEnabled?: boolean;

    @IsOptional()
    @IsString()
    proxyHost?: string;

    @IsOptional()
    @IsInt()
    proxyPort?: number;

    @IsOptional()
    @IsString()
    proxyType?: string; // 'HTTP' or 'SOCKS5'

    @IsOptional()
    @IsString()
    proxyUsername?: string;

    @IsOptional()
    @IsString()
    proxyPassword?: string;

    @IsOptional()
    @IsBoolean()
    sslEnabled?: boolean;

    @IsOptional()
    @IsString()
    sslCA?: string;

    @IsOptional()
    @IsString()
    sslCert?: string;

    @IsOptional()
    @IsString()
    sslKey?: string;
}
