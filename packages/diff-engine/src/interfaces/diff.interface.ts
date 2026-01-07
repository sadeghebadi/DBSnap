import { Readable } from 'stream';

export interface DiffResult {
    added: number;
    removed: number;
    modified: number;
    schemaChanges?: {
        added: string[];
        removed: string[];
        modified: string[];
    };
    details?: string; // S3 Key for detailed diff JSON
}

export interface IDiffEngine {
    compare(streamA: Readable, streamB: Readable, options?: any, metadataA?: any, metadataB?: any): Promise<DiffResult>;
}
