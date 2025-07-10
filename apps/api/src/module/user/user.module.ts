import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRouter } from './user.router';
import { UserAuthMiddleware } from './user.auth.middleware';
import { ConfigProvider } from '@src/config';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [
    SharedModule,
    JwtModule.register({
      secret: ConfigProvider.auth.jwt.user.access.secret,
      signOptions: {
        expiresIn: ConfigProvider.auth.jwt.user.access.expiresIn,
      },
    }),
  ],
  controllers: [UserController],
  providers: [UserService, UserAuthMiddleware],
  exports: [UserService, UserAuthMiddleware],
})
export class UserModule {}