import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
// Request ID will be set by middleware or request ID interceptor

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, body, query, params } = request;
    
    // Use request ID if present, otherwise generate simple ID
    const requestId = (request as any).id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const userId = (request as any).user?.id || 'anonymous';

    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: (data) => {
          const duration = Date.now() - startTime;
          console.log({
            requestId,
            method,
            url,
            userId,
            duration: `${duration}ms`,
            status: 'success',
            timestamp: new Date().toISOString()
          });
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          console.error({
            requestId,
            method,
            url,
            userId,
            duration: `${duration}ms`,
            status: 'error',
            error: error.message,
            timestamp: new Date().toISOString()
          });
        }
      })
    );
  }
}

