import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: any = null;
    const request = ctx.getRequest<{ method?: string; originalUrl?: string; url?: string }>();
    const route = (request.originalUrl || request.url || '').split('?')[0];

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        message = (res as any).message || message;
        errors = (res as any).errors || null;
      }
    } else {
      // Do not expose Prisma, filesystem, or provider errors to API clients.
      const error = exception as { name?: string; code?: string; message?: string } | null;
      const code = typeof error?.code === 'string' ? error.code : undefined;
      const name = typeof error?.name === 'string' ? error.name : 'UnknownError';

      // Convert common persistence failures into actionable HTTP responses.
      // Prisma's raw error text is kept out of the response because it may
      // contain query details or connection information.
      if (code === 'P2002') {
        status = HttpStatus.CONFLICT;
        message = request.method === 'POST' && route.endsWith('/admin/users/create')
          ? 'A user with this email or account identifier already exists. Enter a different email and identifier.'
          : 'A record with one or more unique values already exists.';
      } else if (name === 'PrismaClientInitializationError' || code === 'P1001' || code === 'P1002') {
        status = HttpStatus.SERVICE_UNAVAILABLE;
        message = 'The database is temporarily unavailable. Check the backend database connection and try again.';
      } else if (code === 'P2025') {
        status = HttpStatus.NOT_FOUND;
        message = 'The requested record was not found.';
      }

      // Log only exception metadata, never raw messages, request bodies, or secrets.
      this.logger.error(`Unhandled ${name}${code ? ` (${code})` : ''} on ${request.method || 'HTTP'} ${route}`);
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      errors,
      timestamp: new Date().toISOString(),
    });
  }
}
