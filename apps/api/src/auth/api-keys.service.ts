import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomBytes, createHash } from 'crypto';

@Injectable()
export class ApiKeysService {
    constructor(private prisma: PrismaService) { }

    async createApiKey(userId: string, name: string, scopes: string[] = []) {
        const rawKey = randomBytes(32).toString('hex');
        const prefix = 'dbsnap_';
        const key = `${prefix}${rawKey}`;
        const keyHash = this.hashKey(key);

        await this.prisma.apiKey.create({
            data: {
                userId,
                name,
                keyHash,
                prefix,
                scopes,
            },
        });

        return key; // Return only once
    }

    async validateApiKey(key: string) {
        const keyHash = this.hashKey(key);
        const apiKey = await this.prisma.apiKey.findUnique({
            where: { keyHash },
            include: { user: true },
        });

        if (!apiKey) {
            return null;
        }

        if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
            return null;
        }

        await this.prisma.apiKey.update({
            where: { id: apiKey.id },
            data: { lastUsedAt: new Date() },
        });

        return apiKey.user;
    }

    async listApiKeys(userId: string) {
        return this.prisma.apiKey.findMany({
            where: { userId },
            select: {
                id: true,
                name: true,
                prefix: true,
                scopes: true,
                lastUsedAt: true,
                createdAt: true,
                expiresAt: true,
            },
        });
    }

    async revokeApiKey(userId: string, id: string) {
        // Ensure user owns the key
        const count = await this.prisma.apiKey.count({ where: { id, userId } });
        if (count === 0) return null;

        return this.prisma.apiKey.delete({
            where: { id },
        });
    }

    private hashKey(key: string): string {
        return createHash('sha256').update(key).digest('hex');
    }
}
