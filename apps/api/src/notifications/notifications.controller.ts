import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('projects/:projectId/notifications')
// @UseGuards(JwtAuthGuard)
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Get()
    async findAll(@Param('projectId') projectId: string) {
        return this.notificationsService.findAll(projectId);
    }

    @Post()
    async create(
        @Param('projectId') projectId: string,
        @Body() data: any,
    ) {
        return this.notificationsService.create(projectId, data);
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() data: any,
    ) {
        return this.notificationsService.update(id, data);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.notificationsService.remove(id);
    }
}
