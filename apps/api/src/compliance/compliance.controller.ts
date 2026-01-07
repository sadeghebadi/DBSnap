
import { Controller, Post, Delete, Patch, Get, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ComplianceService } from './compliance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('admin/compliance')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'ROOT', 'SUPPORT') // Adjust based on actual Role names
export class ComplianceController {
    constructor(private readonly complianceService: ComplianceService) { }

    @Post('user/:userId/export')
    async triggerExport(@Param('userId') userId: string, @Request() req: any) {
        return this.complianceService.triggerExport(userId, req.user.id);
    }

    @Delete('user/:userId')
    async deleteUser(@Param('userId') userId: string, @Request() req: any) {
        return this.complianceService.deleteUser(userId, req.user.id);
    }

    @Patch('user/:userId/legal-hold')
    async toggleLegalHold(
        @Param('userId') userId: string,
        @Body() body: { isHeld: boolean; reason?: string },
        @Request() req: any
    ) {
        return this.complianceService.toggleLegalHold(userId, body.isHeld, req.user.id, body.reason);
    }

    @Get('user/:userId/exports')
    async getExports(@Param('userId') userId: string) {
        return this.complianceService.getExports(userId);
    }
}
