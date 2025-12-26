import { createGzip, createGunzip } from 'zlib';
import { createHash } from 'crypto';
import { Transform, TransformCallback } from 'stream';

export class HashTransform extends Transform {
    private hash = createHash('md5');
    private _digest: string = '';

    _transform(chunk: any, encoding: BufferEncoding, callback: TransformCallback): void {
        this.hash.update(chunk);
        this.push(chunk);
        callback();
    }

    _flush(callback: TransformCallback): void {
        this._digest = this.hash.digest('hex');
        callback();
    }

    get digest(): string {
        return this._digest;
    }
}

export function createCompressionStream() {
    return createGzip();
}

export function createDecompressionStream() {
    return createGunzip();
}

export function createHashingStream() {
    return new HashTransform();
}
