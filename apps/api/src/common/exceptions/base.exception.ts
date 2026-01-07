import { HttpException, HttpStatus } from '@nestjs/common';

export abstract class BaseException extends HttpException {
    constructor(
        public readonly code: string,
        message: string,
        status: HttpStatus,
        public readonly details?: any,
    ) {
        super({ code, message, details }, status);
    }
}
