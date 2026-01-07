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
}
