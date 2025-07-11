import { TRPCError } from '@trpc/server';
import {
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';

/**
 * NestJS 예외를 TRPCError로 변환하는 함수
 */
export function transformToTRPCError(error: unknown): TRPCError {
  // 이미 TRPCError인 경우 그대로 반환
  if (error instanceof TRPCError) {
    return error;
  }

  // NestJS HttpException 처리
  if (error instanceof HttpException) {
    const message = error.message;
    const statusCode = error.getStatus();

    // HttpException 타입별로 적절한 TRPC 에러 코드로 매핑
    if (error instanceof BadRequestException) {
      return new TRPCError({
        code: 'BAD_REQUEST',
        message,
      });
    }

    if (error instanceof UnauthorizedException) {
      return new TRPCError({
        code: 'UNAUTHORIZED',
        message,
      });
    }

    if (error instanceof ForbiddenException) {
      return new TRPCError({
        code: 'FORBIDDEN',
        message,
      });
    }

    if (error instanceof NotFoundException) {
      return new TRPCError({
        code: 'NOT_FOUND',
        message,
      });
    }

    if (error instanceof ConflictException) {
      return new TRPCError({
        code: 'CONFLICT',
        message,
      });
    }

    if (error instanceof InternalServerErrorException) {
      return new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message,
      });
    }

    // 기타 HttpException
    if (statusCode >= 400 && statusCode < 500) {
      return new TRPCError({
        code: 'BAD_REQUEST',
        message,
      });
    }

    return new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message,
    });
  }

  // 일반 Error 객체
  if (error instanceof Error) {
    return new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: error.message,
    });
  }

  // 알 수 없는 에러
  return new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
  });
}
