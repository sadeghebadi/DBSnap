import { Controller, Get, Res, HttpStatus } from '@nestjs/common';
import { HealthService } from './health.service';
import type { Response } from 'express';

@Controller('health')
export class HealthController {
    constructor(private healthService: HealthService) { }

    @Get()
    async check(@Res() res: Response) {
        const result = await this.healthService.check();
        const status = result.status === 'ok' ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;
        return res.status(status).json(result);
    }
}
