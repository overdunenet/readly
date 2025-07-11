import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {SharedModule} from '@src/module/shared/shared.module';
import {UserModule} from '@src/module/user/user.module';
import {PostModule} from '@src/module/post/post.module';

@Module({
  imports: [
    SharedModule,
    UserModule,
    PostModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
}
