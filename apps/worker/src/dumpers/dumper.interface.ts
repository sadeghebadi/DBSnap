import { Writable } from 'stream';

export interface DumpMetadata {
    totalRows: number;
    collectionCounts: Record<string, number>;
    checksum?: string;
}

export interface IDumper {
    dump(connectionString: string, stream: Writable): Promise<DumpMetadata>;
}
