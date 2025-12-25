import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';
import { randomBytes, createHash } from 'node:crypto';

@Injectable()
export class ApiKeysService {
    constructor(private prisma: PrismaService) { }

    private generateKey(): string {
        return `db_snap_${randomBytes(32).toString('hex')}`;
    }

    private hashKey(key: string): string {
        return createHash('sha256').update(key).digest('hex');
    }

    async create(userId: string, name: string, scopes: string[]) {
        const rawKey = this.generateKey();
        const hashedKey = this.hashKey(rawKey);
        const prefix = rawKey.substring(0, 12); // "db_snap_xxxx"

        const apiKey = await this.prisma.apiKey.create({
            data: {
                name,
                key: hashedKey,
                prefix,
                scopes,
                userId,
            },
        });

        return {
            ...apiKey,
            key: rawKey, // Only return raw key once on creation
        };
    }

    async findAll(userId: string) {
        return this.prisma.apiKey.findMany({
            where: { userId },
            select: {
                id: true,
                name: true,
                prefix: true,
                scopes: true,
                lastUsedAt: true,
                expiresAt: true,
                createdAt: true,
            },
        });
    }

    async delete(userId: string, id: string) {
        return this.prisma.apiKey.deleteMany({
            where: { id, userId },
        });
    }

    async rotate(userId: string, id: string) {
        const rawKey = this.generateKey();
        const hashedKey = this.hashKey(rawKey);
        const prefix = rawKey.substring(0, 12);

        const apiKey = await this.prisma.apiKey.update({
            where: { id, userId },
            data: {
                key: hashedKey,
                prefix,
            },
        });

        return {
            ...apiKey,
            key: rawKey,
        };
    }

    async validateKey(key: string) {
        const hashedKey = this.hashKey(key);
        const apiKey = await this.prisma.apiKey.findUnique({
            where: { key: hashedKey },
            include: { user: true },
        });

        if (!apiKey) {
            throw new UnauthorizedException('Invalid API key');
        }

        if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
            throw new UnauthorizedException('API key expired');
        }

        // Update last used timestamp
        await this.prisma.apiKey.update({
            where: { id: apiKey.id },
            data: { lastUsedAt: new Date() },
        });

        return {
            user: apiKey.user,
            scopes: apiKey.scopes as string[],
        };
    }
}
