export interface IHasher {
    hash(data: any): string;
    hashBatch(data: any[]): string;
}
