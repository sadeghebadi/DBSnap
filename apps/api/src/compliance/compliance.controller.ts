
import { Controller, Get, Post, Delete, Patch, Body, Param, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { ComplianceService } from './compliance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('compliance')
@UseGuards(JwtAuthGuard)
export class ComplianceController {
    constructor(private readonly complianceService: ComplianceService) { }

    @Post('export')
    async requestExport(@Request() req: any) {
        return this.complianceService.requestExport(req.user.id);
    }

    @Get('export')
    async getExports(@Request() req: any) {
        return this.complianceService.getExports(req.user.id);
    }

    @Delete('data')
    async deleteAccount(@Request() req: any) {
        return this.complianceService.deleteAccount(req.user.id);
    }

    @Patch('legal-hold/:userId')
    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    async toggleLegalHold(@Param('userId') userId: string, @Body('isLegalHold') isLegalHold: boolean) {
        return this.complianceService.toggleLegalHold(userId, isLegalHold);
    }

    @Post(':userId/export')
    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    async adminRequestExport(@Param('userId') userId: string) {
        return this.complianceService.requestExport(userId);
    }

    @Get(':userId/exports')
    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    async adminGetExports(@Param('userId') userId: string) {
        return this.complianceService.getExports(userId);
    }

    @Delete(':userId/data')
    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    async adminDeleteAccount(@Param('userId') userId: string) {
        return this.complianceService.deleteAccount(userId);
    }
}
