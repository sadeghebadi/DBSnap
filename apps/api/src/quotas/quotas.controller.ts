import { Controller, Get, Patch, Param, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { QuotasService } from './quotas.service';

@Controller('admin/quotas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class QuotasController {
    constructor(private readonly quotasService: QuotasService) { }

    @Get(':userId')
    @Roles('ADMIN')
    async getQuota(@Param('userId') userId: string) {
        return this.quotasService.getQuota(userId);
    }

    @Patch(':userId')
    @Roles('ADMIN')
    async updateQuota(
        @Param('userId') userId: string,
        @Body() data: any,
        @Req() req: any
    ) {
        return this.quotasService.updateQuota(userId, data, req.user.id);
    }
}
