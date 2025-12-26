import { Test, TestingModule } from '@nestjs/testing';
import { ConnectionValidatorService, DatabaseType } from './connection-validator.service.js';
import { SshTunnelService } from './ssh-tunnel.service.js';

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

jest.mock('socks-proxy-agent', () => ({
    SocksProxyAgent: jest.fn().mockImplementation(() => ({
        createConnection: jest.fn().mockReturnValue({}),
    })),
}));

jest.mock('http-proxy-agent', () => ({
    HttpProxyAgent: jest.fn().mockImplementation(() => ({
        createConnection: jest.fn().mockReturnValue({}),
    })),
}));

jest.mock('./ssh-tunnel.service.js', () => ({
    SshTunnelService: jest.fn().mockImplementation(() => ({
        createTunnel: jest.fn().mockResolvedValue(undefined),
        closeTunnel: jest.fn().mockResolvedValue(undefined),
    })),
}));

describe('ConnectionValidatorService', () => {
    let service: ConnectionValidatorService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ConnectionValidatorService,
                {
                    provide: SshTunnelService,
                    useValue: {
                        createTunnel: jest.fn().mockResolvedValue(undefined),
                        closeTunnel: jest.fn().mockResolvedValue(undefined),
                    },
                },
            ],
        }).compile();

        service = module.get<ConnectionValidatorService>(ConnectionValidatorService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should validate PostgreSQL connection with SSH tunnel', async () => {
        const sshTunnelService = (service as any).sshTunnelService;

        const result = await service.validate({
            type: DatabaseType.POSTGRESQL,
            host: 'internal-db',
            port: 5432,
            databaseName: 'test',
            username: 'user',
            password: 'pass',
            sshEnabled: true,
            sshHost: 'bastion',
            sshUsername: 'sshuser',
            sshPrivateKey: 'key',
        });

        expect(sshTunnelService.createTunnel).toHaveBeenCalled();
        expect(result.success).toBe(true);
        expect(sshTunnelService.closeTunnel).toHaveBeenCalled();
    });

    it('should validate PostgreSQL connection with SSL', async () => {
        const result = await service.validate({
            type: DatabaseType.POSTGRESQL,
            host: 'secure-db',
            port: 5432,
            databaseName: 'test',
            username: 'user',
            password: 'pass',
            sslEnabled: true,
            sslCA: 'ca-cert',
            sslCert: 'client-cert',
            sslKey: 'client-key',
        });

        expect(result.success).toBe(true);
    });

    it('should validate PostgreSQL connection with SOCKS5 proxy', async () => {
        const result = await service.validate({
            type: DatabaseType.POSTGRESQL,
            host: 'remote-db',
            port: 5432,
            databaseName: 'test',
            username: 'user',
            password: 'pass',
            proxyEnabled: true,
            proxyHost: 'proxy-host',
            proxyPort: 1080,
            proxyType: 'SOCKS5',
        });

        expect(result.success).toBe(true);
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
