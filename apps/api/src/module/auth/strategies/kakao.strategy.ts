import { Injectable, Logger } from '@nestjs/common';
import { TRPCError } from '@trpc/server';
import axios from 'axios';
import { ConfigProvider } from '../../../config';
import {
  SocialLoginStrategy,
  SocialUserProfile,
} from './social-login.strategy';

@Injectable()
export class KakaoStrategy implements SocialLoginStrategy {
  private readonly logger = new Logger(KakaoStrategy.name);

  async getUserProfile(
    code: string,
    _state: string
  ): Promise<SocialUserProfile> {
    const accessToken = await this.fetchAccessToken(code);
    return this.fetchUserProfile(accessToken);
  }

  private fetchAccessToken(code: string): Promise<string> {
    const { clientId, clientSecret, callbackUrl } = ConfigProvider.auth.kakao;

    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: callbackUrl,
      code,
    });

    return axios
      .post<{
        access_token?: string;
        error?: string;
        error_description?: string;
      }>('https://kauth.kakao.com/oauth/token', params.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 5000,
      })
      .then(({ data }) => {
        if (data.error || !data.access_token) {
          this.logger.error(`Kakao token error: ${data.error_description}`);
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: '카카오 인증에 실패했습니다',
          });
        }

        return data.access_token;
      })
      .catch(error => {
        if (error instanceof TRPCError) throw error;
        this.logger.error('Kakao token request error', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '카카오 인증 중 오류가 발생했습니다',
        });
      });
  }

  private fetchUserProfile(accessToken: string): Promise<SocialUserProfile> {
    return axios
      .get<{
        id: number;
        kakao_account?: {
          email?: string;
          profile?: {
            nickname?: string;
            profile_image_url?: string;
          };
        };
      }>('https://kapi.kakao.com/v2/user/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
        timeout: 5000,
      })
      .then(({ data }) => {
        const account = data.kakao_account;

        return {
          providerId: String(data.id),
          provider: 'kakao' as const,
          email: account?.email ?? null,
          nickname: account?.profile?.nickname ?? null,
          profileImage: account?.profile?.profile_image_url ?? null,
        };
      })
      .catch(error => {
        if (error instanceof TRPCError) throw error;
        this.logger.error('Kakao profile request error', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '카카오 프로필 조회 중 오류가 발생했습니다',
        });
      });
  }
}
