import { Injectable } from '@nestjs/common';
import { RepositoryProvider } from '../shared/transaction/repository.provider';
import { UserService } from '../user/user.service';
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
    private readonly userService: UserService,
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
    const tokens = await this.userService.generateTokens(user);

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

  private getStrategy(provider: SocialProvider) {
    if (provider === 'naver') return this.naverStrategy;
    throw new Error(`Unsupported provider: ${provider}`);
  }

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
      return this.repositoryProvider.UserRepository.findOneByOrFail({
        id: existingSocialAccount.userId,
      });
    }

    // TODO: 추후 email이 아닌 본인인증을 통해 user와 연결 필요
    // 2. email로 기존 사용자에 SocialAccount 연결
    if (profile.email) {
      const existingUser = await this.linkSocialAccountToExistingUser(profile);
      if (existingUser) return existingUser;
    }

    // 3. 새 사용자 생성
    return this.createUserWithSocialAccount(profile);
  }

  private async linkSocialAccountToExistingUser(
    profile: SocialUserProfile
  ): Promise<UserEntity | null> {
    const existingUser = await this.repositoryProvider.UserRepository.findOneBy(
      {
        email: profile.email,
      }
    );
    if (!existingUser) return null;

    const socialAccount = SocialAccountEntity.create(existingUser.id);
    this.setProviderIdOnSocialAccount(
      socialAccount,
      profile.provider,
      profile.providerId
    );
    await this.repositoryProvider.SocialAccountRepository.save(socialAccount);
    return existingUser;
  }

  private async createUserWithSocialAccount(
    profile: SocialUserProfile
  ): Promise<UserEntity> {
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
}
