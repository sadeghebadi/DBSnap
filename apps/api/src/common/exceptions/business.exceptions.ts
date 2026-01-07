import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

export class EntityNotFoundException extends BaseException {
    constructor(entityName: string, id: string) {
        super(
            'ENTITY_NOT_FOUND',
            `${entityName} with ID ${id} not found`,
            HttpStatus.NOT_FOUND,
        );
    }
}

export class UnauthorizedActionException extends BaseException {
    constructor(action: string) {
        super(
            'UNAUTHORIZED_ACTION',
            `You are not authorized to perform: ${action}`,
            HttpStatus.FORBIDDEN,
        );
    }
}

export class DatabaseConnectionException extends BaseException {
    constructor(dbName: string, error: string) {
        super(
            'DATABASE_CONNECTION_FAILED',
            `Failed to connect to database ${dbName}: ${error}`,
            HttpStatus.BAD_REQUEST,
        );
    }
}

export class BackupOperationException extends BaseException {
    constructor(operation: string, details: string) {
        super(
            'BACKUP_OPERATION_FAILED',
            `Backup operation failed during ${operation}: ${details}`,
            HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }
}
