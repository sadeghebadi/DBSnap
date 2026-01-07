import { PrismaClient } from '@dbsnap/database';

const prisma = new PrismaClient();

async function main() {
    console.log('Checking Admin...');
    const admin = await prisma.user.findUnique({
        where: { email: 'admin@dbsnap.com' }
    });
    console.log('Admin:', admin);

    const databases = await prisma.database.findMany();
    console.log('Databases:', databases.map(d => ({ id: d.id, name: d.name })));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
