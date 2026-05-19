import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly configService: ConfigService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const requestId = (request as any).id || 'unknown';

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_SERVER_ERROR';
    let details: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || exception.message;
        code = (exceptionResponse as any).code || exception.name;
        details = (exceptionResponse as any).details;
      } else {
        message = exceptionResponse as string;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      code = exception.name;
      
      // Handle database errors
      if ((exception as any).code) {
        const dbError = this.handleDatabaseError(exception as any);
        status = dbError.status;
        message = dbError.message;
        code = dbError.code;
      }
    }

    const isDevelopment = this.configService.get('NODE_ENV') === 'development';

    const errorResponse = {
      success: false,
      error: {
        message,
        code,
        requestId,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        ...(details && { details }),
        ...(isDevelopment && exception instanceof Error && { stack: exception.stack })
      }
    };

    // Log error
    console.error(`Error in ${request.method} ${request.url}:`, {
      requestId,
      error: message,
      stack: isDevelopment && exception instanceof Error ? exception.stack : undefined,
      userId: (request as any).user?.id,
      timestamp: new Date().toISOString()
    });

    response.status(status).json(errorResponse);
  }

  private handleDatabaseError(error: any) {
    const code = error.code || error.original?.code;
    
    switch (code) {
      case '23505': // Unique constraint violation
        return {
          status: HttpStatus.CONFLICT,
          code: 'DUPLICATE_ENTRY',
          message: 'Resource already exists'
        };
      case '23503': // Foreign key constraint violation
        return {
          status: HttpStatus.BAD_REQUEST,
          code: 'FOREIGN_KEY_VIOLATION',
          message: 'Referenced resource does not exist'
        };
      case '23502': // Not null constraint violation
        return {
          status: HttpStatus.BAD_REQUEST,
          code: 'MISSING_REQUIRED_FIELD',
          message: 'Required field is missing'
        };
      default:
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          code: 'DATABASE_ERROR',
          message: this.configService.get('NODE_ENV') === 'production' 
            ? 'Database operation failed' 
            : error.message
        };
    }
  }
}

