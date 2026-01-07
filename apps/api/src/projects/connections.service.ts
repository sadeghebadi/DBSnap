
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
}
