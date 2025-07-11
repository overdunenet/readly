import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedModule } from '@src/module/shared/shared.module';
import { SampleModule } from '@src/module/sample/sample.module';
import { UserModule } from '@src/module/user/user.module';
import { PostModule } from '@src/module/post/post.module';

@Module({
  imports: [SharedModule, SampleModule, UserModule, PostModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
