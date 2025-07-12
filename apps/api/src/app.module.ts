import { Module } from '@nestjs/common';
import { SharedModule } from '@src/module/shared/shared.module';
import { UserModule } from '@src/module/user/user.module';
import { PostModule } from '@src/module/post/post.module';

@Module({
  imports: [SharedModule, UserModule, PostModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
