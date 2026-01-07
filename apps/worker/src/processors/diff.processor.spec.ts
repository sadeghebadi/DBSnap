
import { Test, TestingModule } from '@nestjs/testing';
import { DiffProcessor } from './diff.processor';
import { EncryptionService } from '../encryption/encryption.service';
import { StorageService } from '../storage/storage.service';
import { NotificationOrchestratorService } from '../notifications/notification-orchestrator.service';
import { PassThrough } from 'stream';
import { Job } from 'bullmq';
import { MongoDiffEngine, SqlDiffEngine } from '@dbsnap/diff-engine';

// Mock Diff Engines
jest.mock('@dbsnap/diff-engine', () => ({
    MongoDiffEngine: jest.fn().mockImplementation(() => ({
        compare: jest.fn()
    })),
    SqlDiffEngine: jest.fn().mockImplementation(() => ({
        compare: jest.fn()
    }))
}));

describe('DiffProcessor', () => {
    let processor: DiffProcessor;
    let encryptionService: EncryptionService;
    let storageService: StorageService;
    let prisma: any;
    let notificationOrchestrator: NotificationOrchestratorService;
    let mockMongoDiff: any;
    let mockSqlDiff: any;

    const mockJob = {
        id: 'job-1',
        data: {
            diffId: 'diff-1',
            snapshotAId: 'snap-1',
            snapshotBId: 'snap-2'
        }
    } as Job;

    const mockBackupA = {
        id: 'snap-1',
        status: 'Completed',
        s3Key: 'key-1',
        metadata: { encryption: { iv: 'iv1', authTag: 'tag1' } },
        database: { projectId: 'proj-1', type: 'postgresql' }
    };

    const mockBackupB = {
        id: 'snap-2',
        status: 'Completed',
        s3Key: 'key-2',
        metadata: { encryption: { iv: 'iv2', authTag: 'tag2' } },
        database: { projectId: 'proj-1', type: 'postgresql' }
    };

    beforeEach(async () => {
        // Clear mocks
        (MongoDiffEngine as unknown as jest.Mock).mockClear();
        (SqlDiffEngine as unknown as jest.Mock).mockClear();

        const mockPrisma = {
            diff: { update: jest.fn() },
            backup: { findUniqueOrThrow: jest.fn() }
        };

        const mockEncryptionService = {
            createDecryptionStream: jest.fn().mockImplementation(() => new PassThrough())
        };

        const mockStorageService = {
            downloadStream: jest.fn().mockResolvedValue(new PassThrough())
        };

        const mockNotificationOrchestrator = {
            send: jest.fn()
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DiffProcessor,
                { provide: EncryptionService, useValue: mockEncryptionService },
                { provide: StorageService, useValue: mockStorageService },
                { provide: 'PRISMA_CLIENT', useValue: mockPrisma },
                { provide: NotificationOrchestratorService, useValue: mockNotificationOrchestrator },
            ],
        }).compile();

        processor = module.get<DiffProcessor>(DiffProcessor);
        encryptionService = module.get<EncryptionService>(EncryptionService);
        storageService = module.get<StorageService>(StorageService);
        prisma = module.get('PRISMA_CLIENT');
        notificationOrchestrator = module.get<NotificationOrchestratorService>(NotificationOrchestratorService);

        // Access internal engines if possible, or mock their methods via the class mock
        mockMongoDiff = (processor as any).mongoDiff;
        mockSqlDiff = (processor as any).sqlDiff;
    });

    it('should process SQL diff successfully', async () => {
        // Setup
        prisma.backup.findUniqueOrThrow
            .mockResolvedValueOnce(mockBackupA)
            .mockResolvedValueOnce(mockBackupB);

        const diffResult = { added: 1, removed: 2, modified: 3, schemaChanges: { tables: [] } };
        mockSqlDiff.compare.mockResolvedValue(diffResult);

        await processor.process(mockJob);

        expect(prisma.diff.update).toHaveBeenCalledWith({
            where: { id: 'diff-1' },
            data: expect.objectContaining({ status: 'Processing' })
        });

        expect(mockSqlDiff.compare).toHaveBeenCalled();

        expect(prisma.diff.update).toHaveBeenCalledWith({
            where: { id: 'diff-1' },
            data: expect.objectContaining({
                status: 'Completed',
                added: 1,
                removed: 2,
                modified: 3
            })
        });

        expect(notificationOrchestrator.send).toHaveBeenCalledWith('proj-1', 'DIFF_READY', expect.any(Object));
    });

    it('should process Mongo diff successfully', async () => {
        const mongoBackupA = { ...mockBackupA, database: { ...mockBackupA.database, type: 'MongoDB' } };
        const mongoBackupB = { ...mockBackupB, database: { ...mockBackupB.database, type: 'MongoDB' } };

        prisma.backup.findUniqueOrThrow
            .mockResolvedValueOnce(mongoBackupA)
            .mockResolvedValueOnce(mongoBackupB);

        const diffResult = { added: 5, removed: 0, modified: 0 };
        mockMongoDiff.compare.mockResolvedValue(diffResult);

        await processor.process(mockJob);

        expect(mockMongoDiff.compare).toHaveBeenCalled();
        expect(mockSqlDiff.compare).not.toHaveBeenCalled();
    });

    it('should retry if snapshots are not ready', async () => {
        const pendingBackup = { ...mockBackupA, status: 'InProgress' };
        prisma.backup.findUniqueOrThrow
            .mockResolvedValueOnce(pendingBackup)
            .mockResolvedValueOnce(mockBackupB);

        await expect(processor.process(mockJob)).rejects.toThrow(/Snapshots not ready/);

        // Should NOT mark as failed
        expect(prisma.diff.update).not.toHaveBeenCalledWith(expect.objectContaining({ data: { status: 'Failed' } }));
    });

    it('should fail on runtime error', async () => {
        prisma.backup.findUniqueOrThrow.mockRejectedValue(new Error('DB Error'));

        await expect(processor.process(mockJob)).rejects.toThrow('DB Error');

        expect(prisma.diff.update).toHaveBeenCalledWith({
            where: { id: 'diff-1' },
            data: { status: 'Failed' }
        });
    });
});
