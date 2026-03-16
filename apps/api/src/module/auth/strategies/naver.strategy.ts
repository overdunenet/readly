import { Injectable, Logger } from '@nestjs/common';
import { TRPCError } from '@trpc/server';
import { ConfigProvider } from '../../../config';
import {
  SocialLoginStrategy,
  SocialUserProfile,
} from './social-login.strategy';

@Injectable()
export class NaverStrategy implements SocialLoginStrategy {
  private readonly logger = new Logger(NaverStrategy.name);

  async getUserProfile(
    code: string,
    state: string
  ): Promise<SocialUserProfile> {
    const accessToken = await this.fetchAccessToken(code, state);
    return this.fetchUserProfile(accessToken);
  }

  private async fetchAccessToken(code: string, state: string): Promise<string> {
    const { clientId, clientSecret } = ConfigProvider.auth.naver;

    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      code,
      state,
    });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(
        `https://nid.naver.com/oauth2.0/token?${params.toString()}`,
        {
          method: 'GET',
          signal: controller.signal,
        }
      );

      if (!response.ok) {
        this.logger.error(`Naver token request failed: ${response.status}`);
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: '네이버 인증에 실패했습니다',
        });
      }

      const data = (await response.json()) as {
        access_token?: string;
        error?: string;
        error_description?: string;
      };

      if (data.error || !data.access_token) {
        this.logger.error(`Naver token error: ${data.error_description}`);
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: '네이버 인증에 실패했습니다',
        });
      }

      return data.access_token;
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      this.logger.error('Naver token request error', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: '네이버 인증 중 오류가 발생했습니다',
      });
    } finally {
      clearTimeout(timeout);
    }
  }

  private async fetchUserProfile(
    accessToken: string
  ): Promise<SocialUserProfile> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch('https://openapi.naver.com/v1/nid/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
        signal: controller.signal,
      });

      if (!response.ok) {
        this.logger.error(`Naver profile request failed: ${response.status}`);
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: '네이버 프로필 조회에 실패했습니다',
        });
      }

      const data = (await response.json()) as {
        resultcode: string;
        message: string;
        response: {
          id: string;
          email?: string;
          nickname?: string;
          profile_image?: string;
        };
      };

      if (data.resultcode !== '00') {
        this.logger.error(`Naver profile error: ${data.message}`);
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: '네이버 프로필 조회에 실패했습니다',
        });
      }

      const profile = data.response;

      return {
        providerId: profile.id,
        provider: 'naver',
        email: profile.email ?? null,
        nickname: profile.nickname ?? null,
        profileImage: profile.profile_image ?? null,
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      this.logger.error('Naver profile request error', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: '네이버 프로필 조회 중 오류가 발생했습니다',
      });
    } finally {
      clearTimeout(timeout);
    }
  }
}
