import {
  ContextOptions,
  MiddlewareOptions,
  MiddlewareResponse,
  TRPCMiddleware,
} from 'nestjs-trpc-v2';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { TRPCError } from '@trpc/server';
import { JwtService } from '@nestjs/jwt';
import { ConfigProvider } from '@src/config';
import type { CreateExpressContextOptions } from '@trpc/server/adapters/express';

const jwtService = new JwtService();

export interface UserAuthPayload {
  sub: string;
  email: string;
  type: 'user';
}

@Injectable()
export class UserAuthMiddleware implements TRPCMiddleware {
  use(
    opts: MiddlewareOptions
  ): MiddlewareResponse | Promise<MiddlewareResponse> {
    const { next, ctx } = opts;
    const req: Request = (opts.ctx as ContextOptions).req;

    if (!req.headers.authorization) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    const [authType, token] = req.headers.authorization.split(' ');
    if (authType !== 'Bearer' || !token) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    let userPayload: UserAuthPayload;
    try {
      userPayload = jwtService.verify(token, {
        secret: ConfigProvider.auth.jwt.user.access.secret,
      }) as UserAuthPayload;
    } catch (e) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid token',
        cause: e,
      });
    }

    return next({
      ctx: {
        ...ctx,
        user: userPayload,
      },
    });
  }
}

export interface UserAuthorizedContext extends CreateExpressContextOptions {
  user: UserAuthPayload;
}

@Injectable()
export class OptionalUserAuthMiddleware implements TRPCMiddleware {
  use(
    opts: MiddlewareOptions
  ): MiddlewareResponse | Promise<MiddlewareResponse> {
    const { next, ctx } = opts;
    const req: Request = (opts.ctx as ContextOptions).req;

    const authorization = req.headers.authorization;
    if (!authorization) {
      return next({ ctx: { ...ctx, user: null } });
    }

    const [authType, token] = authorization.split(' ');
    if (authType !== 'Bearer' || !token) {
      return next({ ctx: { ...ctx, user: null } });
    }

    try {
      const userPayload = jwtService.verify(token, {
        secret: ConfigProvider.auth.jwt.user.access.secret,
      }) as UserAuthPayload;

      return next({ ctx: { ...ctx, user: userPayload } });
    } catch {
      return next({ ctx: { ...ctx, user: null } });
    }
  }
}

export interface OptionalUserContext extends CreateExpressContextOptions {
  user: UserAuthPayload | null;
}
