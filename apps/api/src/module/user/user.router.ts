import { z } from 'zod';
import { Input, Query, Router, Mutation } from 'nestjs-trpc';
import { BaseTrpcRouter } from '../trpc/baseTrpcRouter';
import { TRPCError } from '@trpc/server';

const loginCredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string(),
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
  createdAt: z.date(),
  updatedAt: z.date(),
});

@Router({ alias: 'user' })
export class UserRouter extends BaseTrpcRouter {
  /**
   * 사용자 로그인 (이메일/비밀번호)
   */
  @Mutation({
    input: loginCredentialsSchema,
    output: loginResponseSchema,
  })
  async login(
    @Input('email') email: string,
    @Input('password') password: string,
  ) {
    try {
      const result = await this.microserviceClient.send('user.login', {
        email,
        password,
      });
      return result;
    } catch (error) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: error.message || 'Login failed',
      });
    }
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
    try {
      const result = await this.microserviceClient.send('user.refreshToken', refreshToken);
      return result;
    } catch (error) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: error.message || 'Failed to refresh token',
      });
    }
  }

  /**
   * 액세스 토큰 검증 및 사용자 정보 반환
   */
  @Query({
    input: z.object({
      token: z.string(),
    }),
    output: userSchema,
  })
  async validateToken(@Input('token') token: string) {
    try {
      const result = await this.microserviceClient.send('user.validateToken', token);
      return {
        ...result,
        createdAt: new Date(result.createdAt),
        updatedAt: new Date(result.updatedAt),
      };
    } catch (error) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: error.message || 'Invalid token',
      });
    }
  }
}