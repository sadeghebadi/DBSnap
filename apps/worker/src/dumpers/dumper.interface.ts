import { Writable } from 'stream';

export interface DumpMetadata {
    totalRows: number;
    collectionCounts: Record<string, number>;
    checksum?: string;
    schema?: {
        indexes: string[];
        constraints: string[];
    };
    indexes?: any[]; // For Mongo
}

export interface IDumper {
    dump(connectionString: string, stream: Writable): Promise<DumpMetadata>;
}
