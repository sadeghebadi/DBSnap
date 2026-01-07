
import { PrismaClient } from '@dbsnap/database';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Databases...');

    // 1. Ensure Admin exists
    const adminRole = await prisma.role.upsert({
        where: { name: 'ADMIN' },
        update: {},
        create: { name: 'ADMIN' }
    });

    const userRole = await prisma.role.upsert({
        where: { name: 'USER' },
        update: {},
        create: { name: 'USER' }
    });

    const hashedPassword = bcrypt.hashSync('adminpassword123', 10);

    const admin = await prisma.user.upsert({
        where: { email: 'admin@dbsnap.com' },
        update: {
            passwordHash: hashedPassword,
            role: { connect: { id: adminRole.id } },
            isVerified: true
        },
        create: {
            email: 'admin@dbsnap.com',
            passwordHash: hashedPassword,
            role: { connect: { id: adminRole.id } },
            isVerified: true,
            provider: 'EMAIL'
        }
    });

    console.log('Admin user updated with hashed password.');

    // Skipped other seeding to avoid duplicates during maintenance

    console.log('Seeding complete.');
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
