import { Test, TestingModule } from '@nestjs/testing';
import { ConnectionValidatorService, DatabaseType } from './connection-validator.service';
import pg from 'pg';
import mysql from 'mysql2/promise';
import { MongoClient } from 'mongodb';

jest.mock('pg', () => ({
    Client: jest.fn().mockImplementation(() => ({
        connect: jest.fn(),
        query: jest.fn().mockResolvedValue({ rows: [{ version: 'PostgreSQL 14.0' }] }),
        end: jest.fn(),
    })),
}));

jest.mock('mysql2/promise', () => ({
    createConnection: jest.fn().mockResolvedValue({
        execute: jest.fn().mockResolvedValue([[{ version: '8.0.26' }]]),
        end: jest.fn(),
    }),
}));

jest.mock('mongodb', () => ({
    MongoClient: jest.fn().mockImplementation(() => ({
        connect: jest.fn(),
        db: jest.fn().mockReturnValue({
            admin: jest.fn().mockReturnValue({
                command: jest.fn().mockResolvedValue({ version: '5.0.0' }),
            }),
        }),
        close: jest.fn(),
    })),
}));

describe('ConnectionValidatorService', () => {
    let service: ConnectionValidatorService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ConnectionValidatorService],
        }).compile();

        service = module.get<ConnectionValidatorService>(ConnectionValidatorService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should validate PostgreSQL connection', async () => {
        const result = await service.validate({
            type: DatabaseType.POSTGRESQL,
            host: 'localhost',
            port: 5432,
            databaseName: 'test',
            username: 'user',
            password: 'pass',
        });

        expect(result.success).toBe(true);
        expect(result.metadata.engine).toBe('PostgreSQL');
        expect(result.metadata.version).toBe('PostgreSQL 14.0');
    });

    it('should validate MySQL connection', async () => {
        const result = await service.validate({
            type: DatabaseType.MYSQL,
            host: 'localhost',
            port: 3306,
            databaseName: 'test',
            username: 'user',
            password: 'pass',
        });

        expect(result.success).toBe(true);
        expect(result.metadata.engine).toBe('MySQL');
        expect(result.metadata.version).toBe('8.0.26');
    });

    it('should validate MongoDB connection', async () => {
        const result = await service.validate({
            type: DatabaseType.MONGODB,
            host: 'localhost',
            port: 27017,
            databaseName: 'test',
            username: 'user',
            password: 'pass',
        });

        expect(result.success).toBe(true);
        expect(result.metadata.engine).toBe('MongoDB');
        expect(result.metadata.version).toBe('5.0.0');
    });
});
