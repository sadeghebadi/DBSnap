
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from '../encryption/encryption.service';
import { ConnectionValidatorService } from '../database/connection-validator.service';
import { DbType } from '@dbsnap/database';

@Injectable()
export class ConnectionsService {
    constructor(
        private prisma: PrismaService,
        private encryptionService: EncryptionService,
        private validator: ConnectionValidatorService,
    ) { }

    async createConnection(
        projectId: string,
        data: {
            name: string;
            type: DbType;
            connectionString: string;
            isSshTunnel?: boolean;
            sshHost?: string;
            sshPort?: number;
            sshUsername?: string;
            sshPrivateKey?: string;
            isProxy?: boolean;
            proxyHost?: string;
            proxyPort?: number;
            proxyUsername?: string;
            proxyPassword?: string;
            sslMode?: string;
            sslCa?: string;
            sslCert?: string;
            sslKey?: string;
            sslRejectUnauthorized?: boolean;
        },
        userId: string
    ) {
        // 1. Validate connection
        const validation = await this.validator.validateConnection(
            data.type,
            data.connectionString,
            data.isSshTunnel ? {
                host: data.sshHost!,
                port: data.sshPort!,
                username: data.sshUsername!,
                privateKey: data.sshPrivateKey!
            } : undefined,
            data.isProxy ? {
                host: data.proxyHost!,
                port: data.proxyPort!,
                username: data.proxyUsername,
                password: data.proxyPassword
            } : undefined,
            {
                ca: data.sslCa,
                cert: data.sslCert,
                key: data.sslKey,
                rejectUnauthorized: data.sslRejectUnauthorized,
                mode: data.sslMode
            }
        );
        if (!validation.success) {
            throw new Error(`Connection failed: ${validation.message}`);
        }

        // 2. Encrypt connection string
        const encrypted = this.encryptionService.encrypt(data.connectionString);

        // 2b. Encrypt SSH key if provided
        let sshKeyEncrypted = null;
        if (data.isSshTunnel && data.sshPrivateKey) {
            sshKeyEncrypted = this.encryptionService.encrypt(data.sshPrivateKey);
        }

        // 2c. Encrypt Proxy password if provided
        let proxyPasswordEncrypted = null;
        if (data.isProxy && data.proxyPassword) {
            proxyPasswordEncrypted = this.encryptionService.encrypt(data.proxyPassword);
        }

        // 2d. Encrypt SSL Certificates
        let sslCaEncrypted = data.sslCa ? this.encryptionService.encrypt(data.sslCa) : null;
        let sslCertEncrypted = data.sslCert ? this.encryptionService.encrypt(data.sslCert) : null;
        let sslKeyEncrypted = data.sslKey ? this.encryptionService.encrypt(data.sslKey) : null;

        // 3. Save to DB
        return this.prisma.database.create({
            data: {
                name: data.name,
                type: data.type,
                connectionStringEnc: encrypted.content,
                iv: encrypted.iv,
                authTag: encrypted.authTag,
                version: validation.version,
                projectId,
                // SSL Fields
                sslMode: data.sslMode,
                sslCaEnc: sslCaEncrypted?.content,
                sslCaIV: sslCaEncrypted?.iv,
                sslCaAuthTag: sslCaEncrypted?.authTag,
                sslCertEnc: sslCertEncrypted?.content,
                sslCertIV: sslCertEncrypted?.iv,
                sslCertAuthTag: sslCertEncrypted?.authTag,
                sslKeyEnc: sslKeyEncrypted?.content,
                sslKeyIV: sslKeyEncrypted?.iv,
                sslKeyAuthTag: sslKeyEncrypted?.authTag,
                sslRejectUnauthorized: data.sslRejectUnauthorized,
                // SSH Fields
                isSshTunnel: data.isSshTunnel || false,
                sshHost: data.sshHost,
                sshPort: data.sshPort,
                sshUsername: data.sshUsername,
                sshPrivateKeyEnc: sshKeyEncrypted?.content,
                sshPrivateKeyIV: sshKeyEncrypted?.iv,
                sshPrivateKeyAuthTag: sshKeyEncrypted?.authTag,
                // Proxy Fields
                isProxy: data.isProxy || false,
                proxyHost: data.proxyHost,
                proxyPort: data.proxyPort,
                proxyUsername: data.proxyUsername,
                proxyPasswordEnc: proxyPasswordEncrypted?.content,
                proxyPasswordIV: proxyPasswordEncrypted?.iv,
                proxyPasswordAuthTag: proxyPasswordEncrypted?.authTag,
            },
        });
    }

    async listConnections(projectId: string) {
        // Typically we don't return the connection string, but for now we list them.
        return this.prisma.database.findMany({
            where: { projectId },
            select: {
                id: true,
                name: true,
                type: true,
                version: true,
                createdAt: true,
                projectId: true,
                // Do NOT select connectionStringEnc, iv, authTag
            }
        });
    }

    async deleteConnection(id: string) {
        // Add ownership check ideally
        return this.prisma.database.delete({ where: { id } });
    }

    async testConnection(id: string): Promise<{ success: boolean; message: string; latencyMs?: number; version?: string }> {
        const database = await this.prisma.database.findUnique({ where: { id } });
        if (!database) {
            throw new NotFoundException('Database not found');
        }

        // Decrypt connection string
        const connectionString = this.encryptionService.decrypt({
            iv: database.iv,
            content: database.connectionStringEnc,
            authTag: database.authTag
        });

        // Decrypt SSH if applicable
        let sshOptions;
        if (database.isSshTunnel && database.sshHost && database.sshUsername && database.sshPrivateKeyEnc && database.sshPrivateKeyIV && database.sshPrivateKeyAuthTag) {
            const privateKey = this.encryptionService.decrypt({
                iv: database.sshPrivateKeyIV,
                content: database.sshPrivateKeyEnc,
                authTag: database.sshPrivateKeyAuthTag
            });
            sshOptions = {
                host: database.sshHost,
                port: database.sshPort || 22,
                username: database.sshUsername,
                privateKey
            };
        }

        // Decrypt Proxy if applicable
        let proxyOptions;
        if (database.isProxy && database.proxyHost && database.proxyPort) {
            let password;
            if (database.proxyPasswordEnc && database.proxyPasswordIV && database.proxyPasswordAuthTag) {
                password = this.encryptionService.decrypt({
                    iv: database.proxyPasswordIV,
                    content: database.proxyPasswordEnc,
                    authTag: database.proxyPasswordAuthTag
                });
            }

            proxyOptions = {
                host: database.proxyHost,
                port: database.proxyPort,
                username: database.proxyUsername || undefined,
                password
            };
        }

        // Decrypt SSL if applicable
        const sslOptions: any = {
            rejectUnauthorized: database.sslRejectUnauthorized !== false, // default true if null
            mode: database.sslMode || undefined
        };

        if (database.sslCaEnc && database.sslCaIV && database.sslCaAuthTag) {
            sslOptions.ca = this.encryptionService.decrypt({ iv: database.sslCaIV, content: database.sslCaEnc, authTag: database.sslCaAuthTag });
        }
        if (database.sslCertEnc && database.sslCertIV && database.sslCertAuthTag) {
            sslOptions.cert = this.encryptionService.decrypt({ iv: database.sslCertIV, content: database.sslCertEnc, authTag: database.sslCertAuthTag });
        }
        if (database.sslKeyEnc && database.sslKeyIV && database.sslKeyAuthTag) {
            sslOptions.key = this.encryptionService.decrypt({ iv: database.sslKeyIV, content: database.sslKeyEnc, authTag: database.sslKeyAuthTag });
        }

        const startTime = Date.now();
        const result = await this.validator.validateConnection(
            database.type,
            connectionString,
            sshOptions,
            proxyOptions,
            sslOptions
        );
        const latencyMs = Date.now() - startTime;

        return {
            ...result,
            message: result.message || 'Connection successful',
            latencyMs: result.success ? latencyMs : undefined
        };
    }
}

