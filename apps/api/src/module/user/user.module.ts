import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserEntity } from '../domain/user.entity';
import { ConfigProvider } from '@src/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
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