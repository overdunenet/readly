import { z } from 'zod';
import { Input, Router, Mutation, Ctx, UseMiddlewares } from 'nestjs-trpc-v2';
import { BaseTrpcRouter } from '../trpc/baseTrpcRouter';
import {
  UserAuthMiddleware,
  UserAuthorizedContext,
} from '../user/user.auth.middleware';

const socialLoginInputSchema = z.object({
  provider: z.enum(['naver', 'kakao', 'google']),
  code: z.string(),
  state: z.string(),
});

const socialLoginOutputSchema = z.object({
  accessToken: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string(),
    nickname: z.string(),
    profileImage: z.string().nullable(),
    phoneVerified: z.boolean(),
  }),
});

@Router({ alias: 'auth' })
export class AuthRouter extends BaseTrpcRouter {
  @Mutation({
    input: socialLoginInputSchema,
    output: socialLoginOutputSchema,
  })
  async socialLogin(
    @Input() input: z.infer<typeof socialLoginInputSchema>,
    @Ctx() ctx: any
  ) {
    const result = await this.microserviceClient.send(
      'auth.socialLogin',
      input
    );

    // Set refreshToken as httpOnly cookie
    this.cookieService.setRefreshTokenCookie(ctx.res, result.refreshToken);

    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  @Mutation({
    input: z.object({ phone: z.string().regex(/^01[0-9]{8,9}$/) }),
    output: z.object({
      expiresAt: z.string(),
      resendAvailableAt: z.string(),
    }),
  })
  @UseMiddlewares(UserAuthMiddleware)
  async phoneOtpRequest(@Input() input: { phone: string }) {
    return this.microserviceClient.send('auth.phoneOtpRequest', input);
  }

  @Mutation({
    input: z.object({
      phone: z.string().regex(/^01[0-9]{8,9}$/),
      code: z.string().length(6),
    }),
    output: z.object({
      success: z.boolean(),
      phone: z.string(),
      accessToken: z.string(),
    }),
  })
  @UseMiddlewares(UserAuthMiddleware)
  async phoneOtpVerify(
    @Input() input: { phone: string; code: string },
    @Ctx() ctx: UserAuthorizedContext
  ) {
    const result = await this.microserviceClient.send('auth.phoneOtpVerify', {
      ...input,
      userId: ctx.user.sub,
    });

    this.cookieService.setRefreshTokenCookie(ctx.res, result.refreshToken);

    return {
      success: result.success,
      phone: result.phone,
      accessToken: result.accessToken,
    };
  }
}
