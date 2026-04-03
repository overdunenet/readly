import { Module } from '@nestjs/common';
import { SharedModule } from '@src/module/shared/shared.module';
import { UserModule } from '@src/module/user/user.module';
import { PostModule } from '@src/module/post/post.module';
import { FollowModule } from '@src/module/follow/follow.module';
import { AuthModule } from '@src/module/auth/auth.module';
import { CashModule } from '@src/module/cash/cash.module';
import { PaymentModule } from '@src/module/payment/payment.module';
import { BookstoreModule } from '@src/module/bookstore/bookstore.module';
import { UploadModule } from '@src/module/upload/upload.module';

@Module({
  imports: [
    SharedModule,
    UserModule,
    PostModule,
    FollowModule,
    AuthModule,
    CashModule,
    PaymentModule,
    BookstoreModule,
    UploadModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
