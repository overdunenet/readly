import { z } from 'zod';
import { Input, Router, Mutation, Ctx } from 'nestjs-trpc-v2';
import { BaseTrpcRouter } from '../trpc/baseTrpcRouter';

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
}
