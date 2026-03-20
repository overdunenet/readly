import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserEntity, UserStatus } from '../domain/user.entity';
import { ConfigProvider } from '@src/config';
import { RepositoryProvider } from '../shared/transaction/repository.provider';
import { UserResponse } from './user.types';

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: UserResponse;
}

@Injectable()
export class UserService {
  constructor(
    private readonly repositoryProvider: RepositoryProvider,
    private readonly jwtService: JwtService
  ) {}

  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: ConfigProvider.auth.jwt.user.refresh.secret,
      });

      const user = await this.repositoryProvider.UserRepository.findOne({
        where: { id: payload.sub, deletedAt: null },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const tokens = await this.generateTokens(user);

      return {
        ...tokens,
        user: {
          id: user.id,
          email: user.email,
          nickname: user.nickname,
          profileImage: user.profileImage,
          status: user.status,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getMe(userId: string): Promise<UserEntity> {
    const user = await this.repositoryProvider.UserRepository.findOne({
      where: { id: userId, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, nickname: string): Promise<UserEntity> {
    const user = await this.repositoryProvider.UserRepository.findOne({
      where: { id: userId, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 프로필 수정 허용 상태: PENDING_PROFILE (온보딩), ACTIVE (프로필 수정)
    const allowedStatuses = [UserStatus.PENDING_PROFILE, UserStatus.ACTIVE];
    if (!allowedStatuses.includes(user.status)) {
      throw new ForbiddenException('현재 상태에서 프로필을 수정할 수 없습니다');
    }

    // 닉네임 중복 검증 (@DeleteDateColumn이 삭제된 유저를 자동 제외)
    const existingUser = await this.repositoryProvider.UserRepository.findOne({
      where: { nickname },
    });
    if (existingUser && existingUser.id !== userId) {
      throw new ConflictException('이미 사용 중인 닉네임입니다');
    }

    user.nickname = nickname;

    // PENDING_PROFILE 상태에서 프로필 설정 시 ACTIVE로 전환
    if (user.status === UserStatus.PENDING_PROFILE) {
      user.updateStatus(UserStatus.ACTIVE);
    }

    await this.repositoryProvider.UserRepository.save(user);

    return user;
  }

  async generateTokens(
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
