
import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

const BATCH_SIZE = 1000;

async function seed(size: 'SMALL' | 'MEDIUM' | 'LARGE' = 'SMALL') {
    console.log(`Starting seed process: ${size}`);

    let targetRows = 0;
    // Approximations: AuditLog row ~500 bytes (mostly JSON metadata)
    // SMALL: 100MB -> ~200,000 rows
    // MEDIUM: 1GB -> ~2,000,000 rows
    // LARGE: 10GB -> ~20,000,000 rows

    switch (size) {
        case 'SMALL': targetRows = 10000; break; // Reduced for dev speed, real benchmark might need more
        case 'MEDIUM': targetRows = 100000; break;
        case 'LARGE': targetRows = 1000000; break;
    }

    // Create a dummy user for relations
    const user = await prisma.user.upsert({
        where: { email: 'benchmark@dbsnap.com' },
        update: {},
        create: {
            email: 'benchmark@dbsnap.com',
            passwordHash: 'benchmark',
            isVerified: true,
            role: {
                connectOrCreate: {
                    where: { name: 'ADMIN' },
                    create: { name: 'ADMIN' }
                }
            }
        }
    });

    console.log(`Using user: ${user.id}`);

    let createdCount = 0;

    while (createdCount < targetRows) {
        const batch = [];
        for (let i = 0; i < BATCH_SIZE; i++) {
            batch.push({
                userId: user.id,
                action: faker.internet.httpMethod() + ' ' + faker.system.filePath(),
                resourceType: 'BENCHMARK_RESOURCE',
                resourceId: faker.string.uuid(),
                metadata: {
                    ip: faker.internet.ipv4(),
                    userAgent: faker.internet.userAgent(),
                    payload: faker.lorem.paragraphs(2), // beef up the size
                    details: faker.helpers.arrayElements(['login', 'logout', 'view', 'edit', 'delete'], 2),
                    timestamp: faker.date.past().toISOString()
                }
            });
        }

        await prisma.auditLog.createMany({
            data: batch
        });

        createdCount += BATCH_SIZE;
        if (createdCount % 10000 === 0) {
            console.log(`Seeded ${createdCount} / ${targetRows} rows...`);
        }
    }

    console.log(`Seeding complete. Total rows: ${createdCount}`);
}

const sizeArg = process.argv[2] as 'SMALL' | 'MEDIUM' | 'LARGE';

seed(sizeArg || 'SMALL')
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
