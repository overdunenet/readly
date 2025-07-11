import { z } from 'zod';
import {
  Input,
  Query,
  Router,
  Mutation,
  UseMiddlewares,
  Ctx,
} from 'nestjs-trpc';
import { BaseTrpcRouter } from '../trpc/baseTrpcRouter';
import {
  UserAuthMiddleware,
  UserAuthorizedContext,
} from './user.auth.middleware';

const loginCredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const registerInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다'),
  nickname: z.string().min(2).max(20),
});

const registerResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string().email(),
    nickname: z.string(),
  }),
});

const loginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string().email(),
    nickname: z.string(),
    profileImage: z.string().nullable(),
  }),
});

const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  nickname: z.string(),
  profileImage: z.string().nullable(),
});

@Router({ alias: 'user' })
export class UserRouter extends BaseTrpcRouter {
  /**
   * 회원가입
   */
  @Mutation({
    input: registerInputSchema,
    output: registerResponseSchema,
  })
  async register(
    @Input('email') email: string,
    @Input('password') password: string,
    @Input('nickname') nickname: string
  ) {
    const result = await this.microserviceClient.send('user.register', {
      email,
      password,
      nickname,
    });
    return result;
  }

  /**
   * 사용자 로그인 (이메일/비밀번호)
   */
  @Mutation({
    input: loginCredentialsSchema,
    output: loginResponseSchema,
  })
  async login(
    @Input('email') email: string,
    @Input('password') password: string
  ) {
    const result = await this.microserviceClient.send('user.login', {
      email,
      password,
    });
    return result;
  }

  /**
   * 리프레시 토큰을 사용하여 액세스 토큰 갱신
   */
  @Mutation({
    input: z.object({
      refreshToken: z.string(),
    }),
    output: loginResponseSchema,
  })
  async refreshToken(@Input('refreshToken') refreshToken: string) {
    const result = await this.microserviceClient.send(
      'user.refreshToken',
      refreshToken
    );
    return result;
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
