import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { NaverStrategy } from './strategies/naver.strategy';
import { SharedModule } from '../shared/shared.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [SharedModule, UserModule],
  controllers: [AuthController],
  providers: [AuthService, NaverStrategy],
  exports: [AuthService],
})
export class AuthModule {}
