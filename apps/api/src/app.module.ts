import { Module } from '@nestjs/common';
import { SharedModule } from '@src/module/shared/shared.module';
import { UserModule } from '@src/module/user/user.module';
import { PostModule } from '@src/module/post/post.module';
import { FollowModule } from '@src/module/follow/follow.module';
import { AuthModule } from '@src/module/auth/auth.module';

@Module({
  imports: [SharedModule, UserModule, PostModule, FollowModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
