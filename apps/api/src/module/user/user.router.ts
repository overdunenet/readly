import { z } from 'zod';
import { Query, Router, Mutation, UseMiddlewares, Ctx } from 'nestjs-trpc-v2';
import { BaseTrpcRouter } from '../trpc/baseTrpcRouter';
import {
  UserAuthMiddleware,
  UserAuthorizedContext,
} from './user.auth.middleware';

const loginResponseSchema = z.object({
  accessToken: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string().email(),
    nickname: z.string(),
    profileImage: z.string().nullable(),
    phoneVerified: z.boolean(),
  }),
});

const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  nickname: z.string(),
  profileImage: z.string().nullable(),
  phoneVerified: z.boolean(),
});

@Router({ alias: 'user' })
export class UserRouter extends BaseTrpcRouter {
  /**
   * 리프레시 토큰을 사용하여 액세스 토큰 갱신
   */
  @Mutation({
    input: z.object({}),
    output: loginResponseSchema,
  })
  async refreshToken(@Ctx() ctx: any) {
    const refreshToken = this.cookieService.getRefreshTokenFromCookie(ctx.req);
    if (!refreshToken) {
      throw new Error('Refresh token not found');
    }

    const result = await this.microserviceClient.send(
      'user.refreshToken',
      refreshToken
    );

    // Set new refreshToken as httpOnly cookie
    this.cookieService.setRefreshTokenCookie(ctx.res, result.refreshToken);

    // Return response without refreshToken
    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  /**
   * 로그아웃 (쿠키 삭제)
   */
  @Mutation({
    input: z.object({}),
    output: z.boolean(),
  })
  async logout(@Ctx() ctx: any) {
    // Clear refreshToken cookie
    this.cookieService.clearRefreshTokenCookie(ctx.res);
    return true;
  }

  /**
   * 현재 로그인한 사용자 정보 조회
   */
  @UseMiddlewares(UserAuthMiddleware)
  @Query({
    output: userSchema,
  })
  async me(@Ctx() ctx: UserAuthorizedContext) {
    const result = await this.microserviceClient.send('user.getMe', {
      userId: ctx.user.sub,
    });
    return result;
  }
}
