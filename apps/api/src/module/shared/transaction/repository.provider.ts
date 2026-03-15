import { Injectable } from '@nestjs/common';
import { getUserRepository } from '@src/module/domain/user.entity';
import { getPostRepository } from '@src/module/domain/post.entity';
import { getFollowRepository } from '@src/module/domain/follow.entity';
import { getSocialAccountRepository } from '@src/module/domain/social-account.entity';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';

@Injectable()
export class RepositoryProvider {
  constructor(private transaction: TransactionService) {}

  get UserRepository() {
    return getUserRepository(this.transaction);
  }

  get PostRepository() {
    return getPostRepository(this.transaction);
  }

  get FollowRepository() {
    return getFollowRepository(this.transaction);
  }

  get SocialAccountRepository() {
    return getSocialAccountRepository(this.transaction);
  }
}
