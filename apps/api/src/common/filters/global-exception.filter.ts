import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { AppError } from '../errors/app-error.js';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let errorCode = 'INTERNAL_ERROR';
        let details = undefined;

        if (exception instanceof AppError) {
            status = exception.statusCode;
            message = exception.message;
            errorCode = exception.errorCode;
            details = exception.details;
        } else if (exception instanceof HttpException) {
            status = exception.getStatus();
            const res: any = exception.getResponse();
            message = typeof res === 'string' ? res : res.message || message;
            errorCode = 'HTTP_EXCEPTION';
        } else if (exception instanceof Error) {
            message = exception.message;
        }

        this.logger.error(
            `[${errorCode}] ${message}`,
            exception instanceof Error ? exception.stack : JSON.stringify(exception)
        );

        response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            errorCode,
            message,
            details,
        });
    }
}
