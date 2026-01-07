import { createHash } from 'crypto';
import { IHasher } from '../interfaces/hasher.interface';

export class CoreHasher implements IHasher {
    constructor(private readonly algorithm = 'sha256') { }

    hash(data: any): string {
        const canonical = JSON.stringify(data, Object.keys(data).sort());
        return createHash(this.algorithm).update(canonical).digest('hex');
    }

    hashBatch(data: any[]): string {
        const hashes = data.map(item => this.hash(item));
        return createHash(this.algorithm).update(hashes.join('')).digest('hex');
    }
}
