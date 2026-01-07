import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { HeaderAPIKeyStrategy } from 'passport-headerapikey';
import { ApiKeysService } from '../api-keys.service';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(HeaderAPIKeyStrategy, 'api-key') {
    constructor(private apiKeysService: ApiKeysService) {
        super(
            { header: 'X-API-Key', prefix: '' },
            ((apiKey: string, done: any) => {
                done(null, apiKey);
            }) as any
        );
    }

    async validate(apiKey: string): Promise<any> {
        const user = await this.apiKeysService.validateApiKey(apiKey);
        if (!user) {
            throw new UnauthorizedException();
        }
        return user;
    }
}
