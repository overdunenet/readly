import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TRPCError } from '@trpc/server';
import * as crypto from 'crypto';
import { ConfigProvider } from '@src/config';
import { RepositoryProvider } from '../shared/transaction/repository.provider';
import { Transactional } from '../shared/transaction/transaction.decorator';
import { TransactionService } from '../shared/transaction/transaction.service';
import { NaverStrategy } from './strategies/naver.strategy';
import {
  SocialProvider,
  SocialUserProfile,
} from './strategies/social-login.strategy';
import { UserEntity } from '../domain/user.entity';
import { SocialAccountEntity } from '../domain/social-account.entity';

export interface SocialLoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    nickname: string;
    profileImage: string | null;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly repositoryProvider: RepositoryProvider,
    private readonly transactionService: TransactionService,
    private readonly jwtService: JwtService,
    private readonly naverStrategy: NaverStrategy
  ) {}

  async socialLogin(
    provider: SocialProvider,
    code: string,
    state: string
  ): Promise<SocialLoginResponse> {
    const strategy = this.getStrategy(provider);
    const profile = await strategy.getUserProfile(code, state);
    const user = await this.findOrCreateUser(profile);
    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        profileImage: user.profileImage,
      },
    };
  }

  getNaverLoginUrl(): string {
    const { clientId, callbackUrl } = ConfigProvider.auth.naver;
    const state = crypto.randomUUID();
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: callbackUrl,
      state,
    });
    return `https://nid.naver.com/oauth2.0/authorize?${params.toString()}`;
  }

  private getStrategy(provider: SocialProvider) {
    if (provider === 'naver') return this.naverStrategy;
    throw new Error(`Unsupported provider: ${provider}`);
  }

  @Transactional
  private async findOrCreateUser(
    profile: SocialUserProfile
  ): Promise<UserEntity> {
    // 1. SocialAccount로 기존 사용자 검색
    const existingSocialAccount =
      await this.repositoryProvider.SocialAccountRepository.findByProvider(
        profile.provider,
        profile.providerId
      );

    if (existingSocialAccount) {
      const user = await this.repositoryProvider.UserRepository.findOneBy({
        id: existingSocialAccount.userId,
      });
      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found for linked social account',
        });
      }
      return user;
    }

    // 2. email로 기존 사용자 검색 (email이 있을 때만)
    if (profile.email) {
      const existingUser =
        await this.repositoryProvider.UserRepository.findOneBy({
          email: profile.email,
        });

      if (existingUser) {
        const socialAccount = SocialAccountEntity.create(existingUser.id);
        this.setProviderIdOnSocialAccount(
          socialAccount,
          profile.provider,
          profile.providerId
        );
        await this.repositoryProvider.SocialAccountRepository.save(
          socialAccount
        );
        return existingUser;
      }
    }

    // 3. 새 사용자 생성
    const email =
      profile.email ?? `naver_${profile.providerId}@social.readly.co.kr`;
    const nickname =
      profile.nickname ?? `user_${profile.providerId.slice(0, 8)}`;

    const user = new UserEntity();
    user.email = email;
    user.nickname = nickname;
    user.password = null;
    user.profileImage = profile.profileImage;
    const savedUser = await this.repositoryProvider.UserRepository.save(user);

    const socialAccount = SocialAccountEntity.create(savedUser.id);
    this.setProviderIdOnSocialAccount(
      socialAccount,
      profile.provider,
      profile.providerId
    );
    await this.repositoryProvider.SocialAccountRepository.save(socialAccount);

    return savedUser;
  }

  private setProviderIdOnSocialAccount(
    socialAccount: SocialAccountEntity,
    provider: SocialProvider,
    providerId: string
  ): void {
    if (provider === 'naver') socialAccount.naverId = providerId;
    if (provider === 'kakao') socialAccount.kakaoId = providerId;
    if (provider === 'google') socialAccount.googleId = providerId;
  }

  private async generateTokens(
    user: UserEntity
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = {
      sub: user.id,
      email: user.email,
      type: 'user',
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: ConfigProvider.auth.jwt.user.access.secret,
        expiresIn: ConfigProvider.auth.jwt.user.access.expiresIn as any,
      }),
      this.jwtService.signAsync(payload, {
        secret: ConfigProvider.auth.jwt.user.refresh.secret,
        expiresIn: ConfigProvider.auth.jwt.user.refresh.expiresIn as any,
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
