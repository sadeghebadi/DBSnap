import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding test users...');

    // 1. Create Test Organization
    const org = await prisma.organization.upsert({
        where: { id: 'test-org-id' },
        update: {},
        create: {
            id: 'test-org-id',
            name: 'Test Organization',
        },
    });

    console.log(`Organization created/found: ${org.name} (${org.id})`);

    // 2. Create Default Project
    const project = await prisma.project.upsert({
        where: { id: 'default-project-id' },
        update: {},
        create: {
            id: 'default-project-id',
            name: 'Default Project',
            organizationId: org.id,
        },
    });
    console.log(`Project created/found: ${project.name} (${project.id})`);


    const password = 'Password123!';
    const passwordHash = await bcrypt.hash(password, 10);

    const users = [
        { email: 'admin@dbsnap.com', role: Role.ADMIN },
        { email: 'member@dbsnap.com', role: Role.MEMBER },
        { email: 'readonly@dbsnap.com', role: Role.READ_ONLY },
    ];

    for (const userData of users) {
        const user = await prisma.user.upsert({
            where: { email: userData.email },
            update: {
                role: userData.role,
                passwordHash,
                isVerified: true,
                organizationId: org.id,
            },
            create: {
                email: userData.email,
                passwordHash,
                role: userData.role,
                isVerified: true,
                organizationId: org.id,
            },
        });
        console.log(`User ${user.email} created/updated with role ${user.role}`);
    }

    console.log('Seeding complete!');
    console.log(`Credentials: email / ${password}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
