import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService, SocialLoginResponse } from './auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern('auth.socialLogin')
  async socialLogin(
    @Payload() data: { provider: string; code: string; state: string }
  ): Promise<SocialLoginResponse> {
    return this.authService.socialLogin(
      data.provider as 'naver' | 'kakao' | 'google',
      data.code,
      data.state
    );
  }

  @MessagePattern('auth.naverLoginUrl')
  getNaverLoginUrl(): string {
    return this.authService.getNaverLoginUrl();
  }
}
