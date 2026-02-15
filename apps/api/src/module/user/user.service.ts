import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from '../domain/user.entity';
import { ConfigProvider } from '@src/config';
import { RepositoryProvider } from '../shared/transaction/repository.provider';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    nickname: string;
    profileImage: string | null;
  };
}

export interface RegisterInput {
  email: string;
  password: string;
  nickname: string;
}

export interface RegisterResponse {
  user: {
    id: string;
    email: string;
    nickname: string;
  };
}

@Injectable()
export class UserService {
  constructor(
    private readonly repositoryProvider: RepositoryProvider,
    private readonly jwtService: JwtService
  ) {}

  async register(input: RegisterInput): Promise<RegisterResponse> {
    // 이메일 중복 체크
    const exists = await this.repositoryProvider.UserRepository.exist({
      where: { email: input.email },
    });

    if (exists) {
      throw new ConflictException('Email already exists');
    }

    // 새 사용자 생성
    const user = await this.repositoryProvider.UserRepository.register(input);

    return {
      user,
    };
  }

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const { email, password } = credentials;

    // 이메일로 사용자 조회
    const user = await this.repositoryProvider.UserRepository.findOneByOrFail({
      email,
    }).catch(() => {
      throw new UnauthorizedException('Invalid email or password');
    });

    // 비밀번호 검증
    const isPasswordValid = await user.checkPassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // 토큰 생성
    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user,
    };
  }

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
    };
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
