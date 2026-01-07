import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
    constructor(private prisma: PrismaService) { }

    async getOverview() {
        // Parallelize promises for performance
        const [usersCount, projectsCount, databasesCount, backupsAggregate] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.project.count(),
            this.prisma.database.count(),
            this.prisma.backup.aggregate({
                _sum: {
                    sizeBytes: true
                },
                where: {
                    status: 'Completed'
                }
            })
        ]);

        return {
            totalUsers: usersCount,
            totalProjects: projectsCount,
            totalDatabases: databasesCount,
            totalStorageBytes: backupsAggregate._sum.sizeBytes ? backupsAggregate._sum.sizeBytes.toString() : '0', // BigInt to string
        };
    }

    async getOrgUsageStats() {
        const users = await this.prisma.user.findMany({
            include: {
                projects: {
                    include: {
                        databases: {
                            include: {
                                backups: {
                                    where: { status: 'Completed' },
                                    select: { sizeBytes: true }
                                }
                            }
                        }
                    }
                }
            }
        });

        return users.map((user: any) => {
            let totalDatabases = 0;
            let totalSnapshots = 0;
            let totalStorageBytes = BigInt(0);

            user.projects.forEach((project: any) => {
                totalDatabases += project.databases.length;
                project.databases.forEach((db: any) => {
                    totalSnapshots += db.backups.length;
                    db.backups.forEach((backup: any) => {
                        if (backup.sizeBytes) {
                            totalStorageBytes += BigInt(backup.sizeBytes);
                        }
                    });
                });
            });

            return {
                userId: user.id,
                email: user.email,
                databaseCount: totalDatabases,
                snapshotCount: totalSnapshots,
                storageBytes: totalStorageBytes.toString(),
            };
        });
    }

    async getUserResourceDetails(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                projects: {
                    include: {
                        databases: {
                            include: {
                                backups: {
                                    orderBy: { startedAt: 'desc' },
                                    take: 10,
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!user) return null;

        // Flatten all backups for Recent Activity
        const allBackups = user.projects.flatMap(p =>
            p.databases.flatMap(d => d.backups.map(b => ({
                ...b,
                databaseName: d.name,
                projectName: p.name
            })))
        ).sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime()).slice(0, 10);

        return {
            id: user.id,
            email: user.email,
            plan: user.plan,
            createdAt: user.createdAt,
            projects: user.projects.map(p => ({
                id: p.id,
                name: p.name,
                environment: p.environment,
                databaseCount: p.databases.length,
                databases: p.databases.map(d => ({
                    id: d.id,
                    name: d.name,
                    type: d.type,
                    snapshotCount: d.backups.length,
                    latestSnapshot: d.backups[0] || null
                }))
            })),
            recentActivity: allBackups
        };
    }

    async getGlobalDatabases(query?: string, type?: string) {
        return this.prisma.database.findMany({
            where: {
                OR: query ? [
                    { id: { contains: query, mode: 'insensitive' } },
                    { name: { contains: query, mode: 'insensitive' } },
                ] : undefined,
                type: type ? (type as any) : undefined,
            },
            include: {
                project: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                            }
                        }
                    }
                },
                _count: {
                    select: { backups: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 100,
        });
    }

    async getGlobalSnapshots(query?: string, status?: string) {
        return this.prisma.backup.findMany({
            where: {
                OR: query ? [
                    { id: { contains: query, mode: 'insensitive' } },
                    { database: { name: { contains: query, mode: 'insensitive' } } },
                ] : undefined,
                status: status ? (status as any) : undefined,
            },
            include: {
                database: {
                    include: {
                        project: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        email: true,
                                    }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: { startedAt: 'desc' },
            take: 100,
        });
    }
}
