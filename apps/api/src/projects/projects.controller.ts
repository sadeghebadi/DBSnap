import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ProjectsService } from './projects.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { VerifiedGuard } from '../auth/guards/verified.guard.js';

@Controller('projects')
@UseGuards(JwtAuthGuard, VerifiedGuard)
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) { }

    @Post()
    async create(@Req() req: any, @Body() body: { name: string }) {
        return this.projectsService.createProject(req.user.userId, body.name);
    }

    @Get()
    async findAll(@Req() req: any) {
        return this.projectsService.findAll(req.user.userId);
    }

    @Get(':id')
    async findOne(@Req() req: any, @Param('id') id: string) {
        return this.projectsService.findOne(req.user.userId, id);
    }

    @Patch(':id')
    async update(@Req() req: any, @Param('id') id: string, @Body() body: { name: string }) {
        return this.projectsService.update(req.user.userId, id, body);
    }

    @Delete(':id')
    async remove(@Req() req: any, @Param('id') id: string) {
        return this.projectsService.remove(req.user.userId, id);
    }
}
