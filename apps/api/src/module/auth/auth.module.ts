import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigProvider } from '@src/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { NaverStrategy } from './strategies/naver.strategy';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [
    SharedModule,
    JwtModule.register({
      secret: ConfigProvider.auth.jwt.user.access.secret,
      signOptions: {
        expiresIn: ConfigProvider.auth.jwt.user.access.expiresIn as any,
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, NaverStrategy],
  exports: [AuthService],
})
export class AuthModule {}
