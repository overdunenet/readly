import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from './user.service';
import { UserController } from './user.controller';
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
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}