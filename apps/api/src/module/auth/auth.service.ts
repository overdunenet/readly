import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';
import { IsNull } from 'typeorm';
import { RepositoryProvider } from '../shared/transaction/repository.provider';
import { UserService } from '../user/user.service';
import { KakaoStrategy } from './strategies/kakao.strategy';
import { NaverStrategy } from './strategies/naver.strategy';
import { SocialUserProfile } from './strategies/social-login.strategy';
import { UserEntity } from '../domain/user.entity';
import {
  SocialAccountEntity,
  SocialProvider,
} from '../domain/social-account.entity';

export interface SocialLoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    nickname: string;
    profileImage: string | null;
    phoneVerified: boolean;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly repositoryProvider: RepositoryProvider,
    private readonly userService: UserService,
    private readonly naverStrategy: NaverStrategy,
    private readonly kakaoStrategy: KakaoStrategy
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
        phoneVerified: !!user.phone,
      },
    };
  }

  private getStrategy(provider: SocialProvider) {
    if (provider === 'naver') return this.naverStrategy;
    if (provider === 'kakao') return this.kakaoStrategy;
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

    const socialAccount = SocialAccountEntity.create(
      existingUser.id,
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
      profile.email ??
      `${profile.provider}_${profile.providerId}@social.readly.co.kr`;
    const nickname =
      profile.nickname ?? `user_${profile.providerId.slice(0, 8)}`;

    const user = new UserEntity();
    user.email = email;
    user.nickname = nickname;
    user.password = null;
    user.profileImage = profile.profileImage;
    const savedUser = await this.repositoryProvider.UserRepository.save(user);

    const socialAccount = SocialAccountEntity.create(
      savedUser.id,
      profile.provider,
      profile.providerId
    );
    await this.repositoryProvider.SocialAccountRepository.save(socialAccount);
    return savedUser;
  }

  async requestPhoneOtp(phone: string) {
    const existingOtp =
      await this.repositoryProvider.OtpRepository.findByPhone(phone);

    if (
      existingOtp &&
      existingOtp.createdAt.getTime() + 60 * 1000 > Date.now()
    ) {
      throw new Error('1분 후 재전송 가능합니다');
    }

    await this.repositoryProvider.OtpRepository.deleteByPhone(phone);

    const isDev =
      process.env.NODE_ENV === 'development' ||
      process.env.NODE_ENV === 'localdev' ||
      // TODO: 문자인증 연동이후 처리 제거
      1;
    const code = isDev ? '123456' : crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 3 * 60 * 1000);

    const otp = this.repositoryProvider.OtpRepository.create({
      phone,
      code,
      expiresAt,
    });
    await this.repositoryProvider.OtpRepository.save(otp);

    // TODO: SMS 발송 (SmsService.send(phone, code))

    return {
      expiresAt: otp.expiresAt.toISOString(),
      resendAvailableAt: new Date(Date.now() + 60 * 1000).toISOString(),
    };
  }

  async verifyPhoneOtp(userId: string, phone: string, code: string) {
    await this.validateOtp(phone, code);
    return this.completePhoneVerification(userId, phone);
  }

  private async validateOtp(phone: string, code: string): Promise<void> {
    const otp = await this.repositoryProvider.OtpRepository.findByPhone(phone);

    if (!otp) {
      throw new Error('인증번호를 먼저 요청해주세요');
    }

    if (otp.expiresAt < new Date()) {
      throw new Error('인증번호가 만료되었습니다');
    }

    if (otp.code !== code) {
      otp.attempts += 1;
      await this.repositoryProvider.OtpRepository.save(otp);

      if (otp.attempts >= 5) {
        await this.repositoryProvider.OtpRepository.deleteByPhone(phone);
        throw new Error(
          '인증 시도 횟수를 초과했습니다. 인증번호를 다시 요청해주세요'
        );
      }

      throw new Error('인증번호가 일치하지 않습니다');
    }

    await this.repositoryProvider.OtpRepository.deleteByPhone(phone);
  }

  private async completePhoneVerification(userId: string, phone: string) {
    const existingUserWithPhone =
      await this.repositoryProvider.UserRepository.findOne({
        where: { phone, deletedAt: IsNull() },
        lock: { mode: 'pessimistic_write' },
      });

    if (existingUserWithPhone && existingUserWithPhone.id !== userId) {
      await this.mergeUserAccounts(userId, existingUserWithPhone);
      const tokens = await this.userService.generateTokens(
        existingUserWithPhone
      );
      return {
        success: true,
        phone,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    }

    const user = await this.repositoryProvider.UserRepository.findOneOrFail({
      where: { id: userId },
    });
    user.phone = phone;
    await this.repositoryProvider.UserRepository.save(user);

    const tokens = await this.userService.generateTokens(user);
    return {
      success: true,
      phone,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  private async mergeUserAccounts(
    tempUserId: string,
    targetUser: UserEntity
  ): Promise<void> {
    const tempSocialAccounts =
      await this.repositoryProvider.SocialAccountRepository.findByUserId(
        tempUserId
      );

    // 기존 유저의 소셜 계정을 한 번에 조회 (N+1 → 1+1)
    const existingSocialAccounts =
      await this.repositoryProvider.SocialAccountRepository.findByUserId(
        targetUser.id
      );
    const existingProviders = new Set(
      existingSocialAccounts.map(sa => sa.provider)
    );

    for (const tempSa of tempSocialAccounts) {
      if (existingProviders.has(tempSa.provider)) {
        await this.repositoryProvider.SocialAccountRepository.softRemove(
          tempSa
        );
      } else {
        tempSa.userId = targetUser.id;
        await this.repositoryProvider.SocialAccountRepository.save(tempSa);
      }
    }

    const tempUser = await this.repositoryProvider.UserRepository.findOne({
      where: { id: tempUserId },
    });
    if (tempUser) {
      await this.repositoryProvider.UserRepository.softRemove(tempUser);
    }
  }
}
