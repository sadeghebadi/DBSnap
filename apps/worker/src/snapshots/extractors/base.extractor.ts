import { Readable } from 'stream';

export interface ExtractorOptions {
    host: string;
    port: number;
    database?: string;
    username?: string;
    password?: string;
    // Add SSL and Proxy support if needed later, but starting simple
}

export interface ExtractionResult {
    stream: Readable;
    metadata: {
        engine: string;
        tables: string[];
        totalObjects?: number;
    };
}

export interface IDatabaseExtractor {
    extract(options: ExtractorOptions): Promise<ExtractionResult>;
}
