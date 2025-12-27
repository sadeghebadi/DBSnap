import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@dbsnap/database';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(PrismaService.name);

    async onModuleInit() {
        try {
            console.log('[PrismaService] Attempting to connect to database...');
            await this.$connect();
            console.log('[PrismaService] Successfully connected to database');

            // Create default admin user if it doesn't exist
            await this.seedDefaultAdmin();
        } catch (error) {
            console.error('[PrismaService] Failed to connect to database:', error);
            throw error;
        }
    }

    private async seedDefaultAdmin() {
        try {
            const adminEmail = 'admin@dbsnap.com';
            const existingAdmin = await this.user.findUnique({
                where: { email: adminEmail }
            });

            if (!existingAdmin) {
                const passwordHash = await bcrypt.hash('admin', 10);

                // Create organization first
                const org = await this.organization.create({
                    data: {
                        name: 'Admin Organization',
                        isActive: true
                    }
                });

                // Create admin user
                await this.user.create({
                    data: {
                        email: adminEmail,
                        passwordHash,
                        role: 'ADMIN',
                        isVerified: true,
                        isActive: true,
                        organizationId: org.id
                    }
                });

                this.logger.log(`✅ Default admin user created: ${adminEmail} / admin`);
            } else {
                this.logger.log(`✓ Default admin user already exists: ${adminEmail}`);
            }
        } catch (error) {
            this.logger.error('Failed to seed default admin user:', error);
            // Don't throw - allow app to start even if seeding fails
        }
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
