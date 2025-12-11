import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const httpCtx = context.switchToHttp();
    const req = httpCtx.getRequest<Request & { id?: string }>();
    const res = httpCtx.getResponse<Response & { statusCode?: number }>();
    const method = (req as any)?.method;
    const url = (req as any)?.url;
    const reqId = (req as any)?.id;

    return next.handle().pipe(
      tap((data) => {
        const duration = Date.now() - now;
        const payload = {
          level: 'info',
          msg: 'request completed',
          method,
          url,
          reqId,
          status: (res as any)?.statusCode,
          durationMs: duration,
        };
        // eslint-disable-next-line no-console
        console.log(JSON.stringify(payload));
        return data;
      }),
    );
  }
}

