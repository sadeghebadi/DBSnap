import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) { }

    @Post()
    create(@Request() req: any, @Body() createProjectDto: { name: string; environment?: any }) {
        return this.projectsService.create(req.user.id, createProjectDto);
    }

    @Get()
    findAll(@Request() req: any) {
        return this.projectsService.findAll(req.user.id, req.user.role);
    }

    @Get(':id')
    findOne(@Request() req: any, @Param('id') id: string) {
        return this.projectsService.findOne(req.user.id, id);
    }

    @Patch(':id')
    update(@Request() req: any, @Param('id') id: string, @Body() updateProjectDto: { name?: string; environment?: any }) {
        return this.projectsService.update(req.user.id, id, updateProjectDto);
    }

    @Delete(':id')
    remove(@Request() req: any, @Param('id') id: string) {
        return this.projectsService.remove(req.user.id, id);
    }
}
