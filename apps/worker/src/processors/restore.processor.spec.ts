
import { Test, TestingModule } from '@nestjs/testing';
import { RestoreProcessor } from './restore.processor';
import { RestorerFactory } from '../restorers/restorer.factory';
import { EncryptionService } from '../encryption/encryption.service';
import { StorageService } from '../storage/storage.service';
import { NotificationOrchestratorService } from '../notifications/notification-orchestrator.service';
import { PassThrough } from 'stream';
import { Job } from 'bullmq';

describe('RestoreProcessor', () => {
    let processor: RestoreProcessor;
    let restorerFactory: RestorerFactory;
    let encryptionService: EncryptionService;
    let storageService: StorageService;
    let prisma: any;
    let notificationOrchestrator: NotificationOrchestratorService;

    const mockJob = {
        id: 'job-1',
        data: {
            backupId: 'backup-1',
            targetDatabaseId: 'db-1',
            backupKey: 'key/backup.enc',
            iv: 'iv',
            authTag: 'tag',
            mode: 'overwrite'
        }
    } as Job;

    const mockDatabase = {
        id: 'db-1',
        projectId: 'project-1',
        name: 'Target DB',
        type: 'postgresql',
        connectionStringEnc: 'enc-string',
        iv: 'iv',
        authTag: 'tag'
    };

    beforeEach(async () => {
        const mockPrisma = {
            database: { findUnique: jest.fn() }
        };

        const mockRestorerFactory = {
            createRestorer: jest.fn()
        };

        const mockEncryptionService = {
            decrypt: jest.fn().mockReturnValue('postgres://localhost:5432/db'),
            createDecryptionStream: jest.fn()
        };

        const mockStorageService = {
            downloadStream: jest.fn()
        };

        const mockNotificationOrchestrator = {
            send: jest.fn()
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RestoreProcessor,
                { provide: RestorerFactory, useValue: mockRestorerFactory },
                { provide: EncryptionService, useValue: mockEncryptionService },
                { provide: StorageService, useValue: mockStorageService },
                { provide: 'PRISMA_CLIENT', useValue: mockPrisma },
                { provide: NotificationOrchestratorService, useValue: mockNotificationOrchestrator },
            ],
        }).compile();

        processor = module.get<RestoreProcessor>(RestoreProcessor);
        restorerFactory = module.get<RestorerFactory>(RestorerFactory);
        encryptionService = module.get<EncryptionService>(EncryptionService);
        storageService = module.get<StorageService>(StorageService);
        prisma = module.get('PRISMA_CLIENT');
        notificationOrchestrator = module.get<NotificationOrchestratorService>(NotificationOrchestratorService);
    });

    it('should process restore successfully', async () => {
        // Setup Mocks
        prisma.database.findUnique.mockResolvedValue(mockDatabase);

        const mockRestorer = {
            restore: jest.fn().mockResolvedValue(undefined)
        };
        (restorerFactory.createRestorer as jest.Mock).mockReturnValue(mockRestorer);

        const mockS3Stream = new PassThrough();
        (storageService.downloadStream as jest.Mock).mockResolvedValue(mockS3Stream);

        const mockDecryptStream = new PassThrough();
        (encryptionService.createDecryptionStream as jest.Mock).mockReturnValue(mockDecryptStream);

        // Run
        await processor.process(mockJob);

        // Assertions
        expect(prisma.database.findUnique).toHaveBeenCalledWith({ where: { id: 'db-1' } });
        expect(encryptionService.decrypt).toHaveBeenCalled();
        expect(restorerFactory.createRestorer).toHaveBeenCalledWith('postgresql');
        expect(storageService.downloadStream).toHaveBeenCalledWith('key/backup.enc');
        expect(encryptionService.createDecryptionStream).toHaveBeenCalledWith('iv', 'tag');
        expect(mockRestorer.restore).toHaveBeenCalledWith(
            'postgres://localhost:5432/db',
            mockDecryptStream,
            { tables: undefined, mode: 'overwrite' }
        );
        expect(notificationOrchestrator.send).toHaveBeenCalledWith('project-1', 'RESTORE_SUCCESS', expect.any(Object));
    });

    it('should fail if target DB missing', async () => {
        prisma.database.findUnique.mockResolvedValue(null);

        await expect(processor.process(mockJob)).rejects.toThrow('Target DB not found');
    });

    it('should handle restore failure', async () => {
        prisma.database.findUnique.mockResolvedValue(mockDatabase);
        (storageService.downloadStream as jest.Mock).mockRejectedValue(new Error('S3 Error'));

        await expect(processor.process(mockJob)).rejects.toThrow('S3 Error');

        expect(notificationOrchestrator.send).toHaveBeenCalledWith('project-1', 'RESTORE_FAILURE', expect.any(Object));
    });
});
