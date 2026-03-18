import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Transactional } from '../shared/transaction/transaction.decorator';
import { TransactionService } from '../shared/transaction/transaction.service';
import { AuthService, SocialLoginResponse } from './auth.service';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly transactionService: TransactionService
  ) {}

  @MessagePattern('auth.socialLogin')
  @Transactional
  async socialLogin(
    @Payload() data: { provider: string; code: string; state: string }
  ): Promise<SocialLoginResponse> {
    return this.authService.socialLogin(
      data.provider as 'naver' | 'kakao' | 'google',
      data.code,
      data.state
    );
  }

  @MessagePattern('auth.phoneOtpRequest')
  async phoneOtpRequest(@Payload() data: { phone: string }) {
    return this.authService.requestPhoneOtp(data.phone);
  }

  @MessagePattern('auth.phoneOtpVerify')
  @Transactional
  async phoneOtpVerify(
    @Payload() data: { userId: string; phone: string; code: string }
  ) {
    return this.authService.verifyPhoneOtp(data.userId, data.phone, data.code);
  }
}
