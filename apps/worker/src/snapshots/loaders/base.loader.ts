export interface LoaderOptions {
    host: string;
    port: number;
    database?: string;
    username?: string;
    password?: string;
}

export interface RestoreOptions {
    tables?: string[]; // If empty, restore everything
    mode: 'OVERWRITE' | 'APPEND';
}

export interface IDatabaseLoader {
    connect(options: LoaderOptions): Promise<void>;
    prepareTable(tableName: string, mode: 'OVERWRITE' | 'APPEND'): Promise<void>;
    loadObject(tableName: string, data: any): Promise<void>;
    disconnect(): Promise<void>;
}
