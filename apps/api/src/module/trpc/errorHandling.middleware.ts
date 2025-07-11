import {
  MiddlewareOptions,
  MiddlewareResponse,
  TRPCMiddleware,
} from 'nestjs-trpc';
import { Injectable } from '@nestjs/common';
import { transformToTRPCError } from '@src/utils/trpc-error-transformer';

/**
 * Global error handling middleware for tRPC
 * Automatically transforms NestJS exceptions to TRPCError
 */
@Injectable()
export class ErrorHandlingMiddleware implements TRPCMiddleware {
  async use(opts: MiddlewareOptions): Promise<MiddlewareResponse> {
    const { next, ctx } = opts;

    try {
      // Continue to the next middleware or procedure
      return await next({ ctx: ctx as Record<string, unknown> });
    } catch (error) {
      // Transform any error to TRPCError
      throw transformToTRPCError(error);
    }
  }
}
