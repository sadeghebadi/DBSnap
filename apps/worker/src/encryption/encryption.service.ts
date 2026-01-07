import { Injectable } from '@nestjs/common';
import { createCipheriv, createDecipheriv, randomBytes, scryptSync, CipherGCM } from 'crypto';
import { Transform } from 'stream';

@Injectable()
export class EncryptionService {
    private readonly algorithm = 'aes-256-gcm';
    private readonly masterKey: Buffer;

    constructor() {
        const key = process.env.ENCRYPTION_KEY || 'default-secret-key-must-be-changed';
        this.masterKey = scryptSync(key, 'salt', 32);
    }

    encrypt(text: string): { iv: string; content: string; authTag: string } {
        const iv = randomBytes(16);
        const cipher = createCipheriv(this.algorithm, this.masterKey, iv);

        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        return {
            iv: iv.toString('hex'),
            content: encrypted,
            authTag: cipher.getAuthTag().toString('hex'),
        };
    }

    decrypt(hash: { iv: string; content: string; authTag: string }): string {
        const decipher = createDecipheriv(
            this.algorithm,
            this.masterKey,
            Buffer.from(hash.iv, 'hex')
        );

        decipher.setAuthTag(Buffer.from(hash.authTag, 'hex'));

        let decrypted = decipher.update(hash.content, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    }

    createEncryptionStream(): { iv: Buffer; stream: CipherGCM } {
        const iv = randomBytes(16);
        const cipher = createCipheriv(this.algorithm, this.masterKey, iv);
        return { iv, stream: cipher };
    }

    createDecryptionStream(ivHex: string, authTagHex: string): Transform {
        const decipher = createDecipheriv(
            this.algorithm,
            this.masterKey,
            Buffer.from(ivHex, 'hex')
        );
        decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
        return decipher;
    }
}
