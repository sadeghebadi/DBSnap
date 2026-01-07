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
}
