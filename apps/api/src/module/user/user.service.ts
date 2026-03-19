import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from '../domain/user.entity';
import { ConfigProvider } from '@src/config';
import { RepositoryProvider } from '../shared/transaction/repository.provider';

export interface LoginResponse {
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
          phoneVerified: !!user.phone,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getMe(userId: string): Promise<{
    id: string;
    email: string;
    nickname: string;
    profileImage: string | null;
    phoneVerified: boolean;
  }> {
    const user = await this.repositoryProvider.UserRepository.findOne({
      where: { id: userId, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      profileImage: user.profileImage,
      phoneVerified: !!user.phone,
    };
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
