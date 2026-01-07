
import { Test, TestingModule } from '@nestjs/testing';
import { BackupProcessor } from './backup.processor';
import { DumperFactory } from '../dumpers/dumper.factory';
import { EncryptionService } from '../encryption/encryption.service';
import { StorageService } from '../storage/storage.service';
import { AnalysisService } from '../analysis/analysis.service';
import { NotificationOrchestratorService } from '../notifications/notification-orchestrator.service';
import { PassThrough } from 'stream';
import { Job } from 'bullmq';

describe('BackupProcessor', () => {
    let processor: BackupProcessor;
    let dumperFactory: DumperFactory;
    let encryptionService: EncryptionService;
    let storageService: StorageService;
    let prisma: any;
    let notificationOrchestrator: NotificationOrchestratorService;
    let analysisService: AnalysisService;

    const mockJob = {
        id: 'job-1',
        data: {
            databaseId: 'db-1',
            backupId: 'backup-1',
            isEphemeral: false
        }
    } as Job;

    const mockDatabase = {
        id: 'db-1',
        projectId: 'project-1',
        name: 'Test DB',
        type: 'postgresql',
        connectionStringEnc: 'enc-string',
        iv: 'iv',
        authTag: 'tag',
        project: {
            isSuspended: false,
            user: { isSuspended: false }
        }
    };

    beforeEach(async () => {
        const mockPrisma = {
            database: { findUnique: jest.fn() },
            backup: { update: jest.fn(), create: jest.fn() }
        };

        const mockDumperFactory = {
            createDumper: jest.fn()
        };

        const mockEncryptionService = {
            decrypt: jest.fn().mockReturnValue('postgres://localhost:5432/db'),
            createEncryptionStream: jest.fn()
        };

        const mockStorageService = {
            uploadStream: jest.fn()
        };

        const mockNotificationOrchestrator = {
            send: jest.fn()
        };

        const mockAnalysisService = {
            checkAnomalies: jest.fn()
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BackupProcessor,
                { provide: DumperFactory, useValue: mockDumperFactory },
                { provide: EncryptionService, useValue: mockEncryptionService },
                { provide: StorageService, useValue: mockStorageService },
                { provide: 'PRISMA_CLIENT', useValue: mockPrisma },
                { provide: NotificationOrchestratorService, useValue: mockNotificationOrchestrator },
                { provide: AnalysisService, useValue: mockAnalysisService }
            ],
        }).compile();

        processor = module.get<BackupProcessor>(BackupProcessor);
        dumperFactory = module.get<DumperFactory>(DumperFactory);
        encryptionService = module.get<EncryptionService>(EncryptionService);
        storageService = module.get<StorageService>(StorageService);
        prisma = module.get('PRISMA_CLIENT');
        notificationOrchestrator = module.get<NotificationOrchestratorService>(NotificationOrchestratorService);
        analysisService = module.get<AnalysisService>(AnalysisService);
    });

    it('should process backup successfully', async () => {
        // Setup Mocks
        prisma.database.findUnique.mockResolvedValue(mockDatabase);

        const mockDumper = {
            dump: jest.fn().mockImplementation((conn, stream) => {
                stream.end(); // Simulate end of stream
                return Promise.resolve({ totalRows: 100, collectionCounts: {}, schema: {}, indexes: [] });
            })
        };
        (dumperFactory.createDumper as jest.Mock).mockReturnValue(mockDumper);

        const mockEncryptStream = new PassThrough();
        (mockEncryptStream as any).getAuthTag = jest.fn().mockReturnValue(Buffer.from('auth-tag'));
        (encryptionService.createEncryptionStream as jest.Mock).mockReturnValue({
            iv: Buffer.from('iv'),
            stream: mockEncryptStream
        });

        const mockStorageStream = new PassThrough();
        (storageService.uploadStream as jest.Mock).mockReturnValue({
            writeStream: mockStorageStream,
            done: Promise.resolve()
        });

        // Run
        await processor.process(mockJob);

        // Assertions
        expect(prisma.database.findUnique).toHaveBeenCalledWith({ where: { id: 'db-1' }, include: expect.any(Object) });
        expect(encryptionService.decrypt).toHaveBeenCalled();
        expect(dumperFactory.createDumper).toHaveBeenCalledWith('postgresql');
        expect(prisma.backup.update).toHaveBeenCalledWith(expect.objectContaining({
            where: { id: 'backup-1' },
            data: expect.objectContaining({ status: 'Completed', totalRows: 100n })
        }));
        expect(notificationOrchestrator.send).toHaveBeenCalledWith('project-1', 'BACKUP_SUCCESS', expect.any(Object));
    });

    it('should fail if project is suspended', async () => {
        const suspendedDb = { ...mockDatabase, project: { isSuspended: true, suspensionReason: 'Non-payment', user: { isSuspended: false } } };
        prisma.database.findUnique.mockResolvedValue(suspendedDb);

        await expect(processor.process(mockJob)).rejects.toThrow(/Project "Test DB" is suspended/);

        expect(prisma.backup.update).toHaveBeenCalledWith({
            where: { id: 'backup-1' },
            data: { status: 'Failed' }
        });
    });

    it('should handle runtime errors', async () => {
        prisma.database.findUnique.mockResolvedValue(mockDatabase);
        (dumperFactory.createDumper as jest.Mock).mockImplementation(() => {
            throw new Error('Dumper error');
        });

        await expect(processor.process(mockJob)).rejects.toThrow('Dumper error');

        expect(prisma.backup.update).toHaveBeenCalledWith({
            where: { id: 'backup-1' },
            data: { status: 'Failed' }
        });
    });
});
