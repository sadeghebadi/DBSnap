import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { BaseException } from '../exceptions/base.exception';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    constructor(private readonly httpAdapterHost: HttpAdapterHost) { }

    catch(exception: unknown, host: ArgumentsHost): void {
        const { httpAdapter } = this.httpAdapterHost;
        const ctx = host.switchToHttp();

        let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
        let errorCode = 'INTERNAL_SERVER_ERROR';
        let message = 'An unexpected error occurred';
        let details: any = null;

        if (exception instanceof BaseException) {
            httpStatus = exception.getStatus();
            errorCode = exception.code;
            message = exception.message;
            details = exception.details;
            this.logger.warn(`Business Exception: [${errorCode}] ${message}`);
        } else if (exception instanceof HttpException) {
            httpStatus = exception.getStatus();
            const response = exception.getResponse() as any;
            errorCode = typeof response === 'object' ? response.code || 'HTTP_EXCEPTION' : 'HTTP_EXCEPTION';
            message = typeof response === 'object' ? response.message || exception.message : exception.message;
            details = typeof response === 'object' ? response.details || null : null;
            this.logger.warn(`HTTP Exception: [${httpStatus}] ${message}`);
        } else {
            // Log unexpected errors with stack trace
            this.logger.error('Unexpected Exception:', exception);
            if (exception instanceof Error) {
                message = process.env.NODE_ENV === 'production' ? message : exception.message;
            }
        }

        const responseBody = {
            success: false,
            error: {
                code: errorCode,
                message: message,
                details: details,
                timestamp: new Date().toISOString(),
                path: httpAdapter.getRequestUrl(ctx.getRequest()),
            },
        };

        httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
    }
}
