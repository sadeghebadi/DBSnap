
import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { ConnectionsService } from './connections.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DbType } from '@dbsnap/database';

@Controller('projects/:projectId/connections')
@UseGuards(JwtAuthGuard)
export class ConnectionsController {
    constructor(private readonly connectionsService: ConnectionsService) { }

    @Post()
    async create(
        @Param('projectId') projectId: string,
        @Body() body: { name: string; type: DbType; connectionString: string },
        @Request() req: any,
    ) {
        if (!body.name || !body.type || !body.connectionString) {
            throw new BadRequestException('Missing required fields');
        }
        return this.connectionsService.createConnection(projectId, body, req.user.userId);
    }

    @Get()
    async list(@Param('projectId') projectId: string) {
        return this.connectionsService.listConnections(projectId);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.connectionsService.deleteConnection(id);
    }
}
