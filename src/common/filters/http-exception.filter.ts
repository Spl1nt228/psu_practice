import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { STATUS_CODES } from 'node:http';
import { Request, Response } from 'express';

type ExceptionResponse = {
  statusCode?: number;
  error?: string;
  message?: string | string[];
};

type ErrorResponse = {
  statusCode: number;
  error: string;
  message: string;
  details: string[] | null;
  path: string;
  timestamp: string;
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    const statusCode = this.getStatusCode(exception);
    const exceptionResponse = this.getExceptionResponse(exception);
    const error = this.getError(statusCode, exceptionResponse);
    const { message, details } = this.getMessageAndDetails(
      exception,
      exceptionResponse,
    );

    if (statusCode === Number(HttpStatus.INTERNAL_SERVER_ERROR)) {
      this.logger.error(
        message,
        exception instanceof Error ? exception.stack : '',
      );
    }

    response.status(statusCode).json({
      statusCode,
      error,
      message,
      details,
      path: request.url,
      timestamp: new Date().toISOString(),
    } satisfies ErrorResponse);
  }

  private getStatusCode(exception: unknown) {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private getExceptionResponse(exception: unknown) {
    if (!(exception instanceof HttpException)) {
      return undefined;
    }

    const response = exception.getResponse();

    if (typeof response === 'string') {
      return {
        message: response,
      };
    }

    return response as ExceptionResponse;
  }

  private getError(statusCode: number, exceptionResponse?: ExceptionResponse) {
    return exceptionResponse?.error ?? STATUS_CODES[statusCode] ?? 'Error';
  }

  private getMessageAndDetails(
    exception: unknown,
    exceptionResponse?: ExceptionResponse,
  ) {
    const responseMessage = exceptionResponse?.message;

    if (Array.isArray(responseMessage)) {
      return {
        message: 'Validation failed',
        details: responseMessage,
      };
    }

    if (typeof responseMessage === 'string') {
      return {
        message: responseMessage,
        details: null,
      };
    }

    if (exception instanceof Error && exception.message) {
      return {
        message: exception.message,
        details: null,
      };
    }

    return {
      message: 'Internal server error',
      details: null,
    };
  }
}
