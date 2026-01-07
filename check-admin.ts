
const { PrismaClient } = require('@dbsnap/database');
const prisma = new PrismaClient();
async function main() {
    const admin = await prisma.user.findUnique({ where: { email: 'admin@dbsnap.com' } });
    console.log('Admin User:', admin ? 'Found' : 'Not Found');
    if (admin) console.log('Password Hash:', admin.password ? 'Exists' : 'Missing');
}
main().finally(() => prisma.$disconnect());
