import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class ContextInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();

        // Most auth guards populate request.user
        // Adding it to a custom property that pino-http serializer can pick up easily if needed
        // or just ensuring it's accessible.

        // We already configured the req serializer in LoggerModule.forRoot in AppModule
        // to pick up userId: req.user?.id.

        // This interceptor can be used for more advanced context like correlation IDs
        // if not already handled by pino-http.

        return next.handle();
    }
}
