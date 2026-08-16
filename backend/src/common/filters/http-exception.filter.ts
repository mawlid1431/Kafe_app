import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Request, Response } from 'express';

type ErrorBody = {
  statusCode: number;
  message: string;
  errors?: string[];
  path: string;
};

/**
 * One error shape for the whole API.
 *
 * The frontend shows `message` directly in a toast, so it must always be a
 * readable, user-facing sentence rather than a stack trace or error code.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Http');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const body = this.toBody(exception, request.url);

    if (body.statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.url} → ${body.statusCode}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(body.statusCode).json(body);
  }

  private toBody(exception: unknown, path: string): ErrorBody {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();

      if (typeof payload === 'string') {
        return { statusCode: status, message: payload, path };
      }

      const record = payload as { message?: string | string[]; error?: string };
      const message = Array.isArray(record.message)
        ? (record.message[0] ?? 'Request failed.')
        : (record.message ?? record.error ?? 'Request failed.');

      return {
        statusCode: status,
        message,
        errors: Array.isArray(record.message) ? record.message : undefined,
        path,
      };
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.fromPrisma(exception, path);
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Something went wrong. Please try again.',
      path,
    };
  }

  private fromPrisma(error: Prisma.PrismaClientKnownRequestError, path: string): ErrorBody {
    switch (error.code) {
      case 'P2002': {
        const target = (error.meta?.target as string[] | undefined)?.join(', ');
        return {
          statusCode: HttpStatus.CONFLICT,
          message: target ? `${target} already exists.` : 'That value already exists.',
          path,
        };
      }
      case 'P2025':
        return { statusCode: HttpStatus.NOT_FOUND, message: 'Record not found.', path };
      case 'P2003':
        return {
          statusCode: HttpStatus.CONFLICT,
          message: 'That record is still referenced by other data.',
          path,
        };
      default:
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'The request could not be completed.',
          path,
        };
    }
  }
}
