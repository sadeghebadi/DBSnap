import { Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';
import * as QRCode from 'qrcode';

@Injectable()
export class MfaService {
    constructor() {
        authenticator.options = { window: 1 }; // Allow 1 step window for clock skew
    }

    async generateSecret(email: string) {
        const secret = authenticator.generateSecret();
        const otpauthUrl = authenticator.keyuri(email, 'DBSnap', secret);
        return {
            secret,
            otpauthUrl,
        };
    }

    async generateQrCode(otpauthUrl: string) {
        return QRCode.toDataURL(otpauthUrl);
    }

    verifyToken(token: string, secret: string) {
        return authenticator.verify({ token, secret });
    }
}
