import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Starting User Seeding ---');

    const users = [
        {
            email: 'admin@dbsnap.com',
            password: 'adminpassword123',
            role: 'ROOT',
        },
        {
            email: 'customer@dbsnap.com',
            password: 'customerpassword123',
            role: 'CUSTOMER',
        },
        {
            email: 'dev@dbsnap.com',
            password: 'devpassword123',
            role: 'CUSTOMER_DEVELOPER',
        }
    ];

    for (const userData of users) {
        const { email, password, role } = userData;

        // Check if role exists
        const roleRecord = await prisma.role.findFirst({
            where: { name: role }
        });

        if (!roleRecord) {
            console.warn(`Role ${role} not found, skipping user ${email}`);
            continue;
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const user = await prisma.user.upsert({
            where: { email },
            update: {
                passwordHash,
                roleId: roleRecord.id,
                isVerified: true,
            },
            create: {
                email,
                passwordHash,
                roleId: roleRecord.id,
                isVerified: true,
            },
        });

        console.log(`User seeded: ${user.email} with role ${role}`);
    }

    console.log('--- User Seeding Completed ---');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
