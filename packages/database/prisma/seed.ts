import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const permissions = [
        'user:read',
        'user:write',
        'project:read',
        'project:write',
        'db:read',
        'db:write',
        'backup:read',
        'backup:create',
        'backup:restore',
    ];

    console.log('Seeding permissions...');
    for (const action of permissions) {
        await prisma.permission.upsert({
            where: { id: action }, // Using action as ID for simplicity if schema allows calling it unique, but schema uses UUID. Adjusting to findFirst or create.
            update: {},
            create: { action },
        });
    }

    // To make it simpler with UUIDs, let's just create them if they don't exist by action
    // Actually schema has permission.action as a field, not unique. Let's rely on finding by action.

    const allPermissions = await prisma.permission.findMany();

    const getPerms = (actions: string[]) => allPermissions.filter(p => actions.includes(p.action));

    const roles = [
        {
            name: 'ROOT',
            permissions: permissions, // All permissions
        },
        {
            name: 'ADMIN',
            permissions: ['user:read', 'user:write', 'project:read', 'project:write', 'db:read', 'db:write', 'backup:read', 'backup:create', 'backup:restore'],
        },
        {
            name: 'CUSTOMER',
            permissions: ['project:read', 'project:write', 'db:read', 'db:write', 'backup:read', 'backup:create'],
        },
        {
            name: 'CUSTOMER_DEVELOPER',
            permissions: ['project:read', 'db:read', 'backup:read'],
        },
    ];

    console.log('Seeding roles...');
    for (const role of roles) {
        // First ensure permissions exist (created above, but let's fetch IDs)
        // We already have allPermissions.

        // We need to upsert permissions again or just map them properly?
        // Let's optimize.

        // Create Permissions first
        for (const action of role.permissions) {
            const existing = allPermissions.find(p => p.action === action);
            if (!existing) {
                await prisma.permission.create({ data: { action } });
            }
        }

        // Refetch to be sure
        const currentPerms = await prisma.permission.findMany({
            where: { action: { in: role.permissions } }
        });

        await prisma.role.upsert({
            where: { name: role.name },
            update: {
                permissions: {
                    set: [], // Reset
                    connect: currentPerms.map(p => ({ id: p.id }))
                }
            },
            create: {
                name: role.name,
                permissions: {
                    connect: currentPerms.map(p => ({ id: p.id }))
                }
            },
        });
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
