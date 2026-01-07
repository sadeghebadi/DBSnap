import { Readable } from 'stream';

export interface RestoreOptions {
    tables?: string[];
    mode?: 'append' | 'overwrite';
}

export interface IRestorer {
    restore(connectionString: string, stream: Readable, options?: RestoreOptions): Promise<void>;
}
