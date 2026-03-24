import { Injectable } from '@nestjs/common';
import { getUserRepository } from '@src/module/domain/user.entity';
import { getPostRepository } from '@src/module/domain/post.entity';
import { getFollowRepository } from '@src/module/domain/follow.entity';
import { getSocialAccountRepository } from '@src/module/domain/social-account.entity';
import { getOtpRepository } from '@src/module/domain/otp.entity';
import { getPaymentRepository } from '@src/module/domain/payment.entity';
import { getCashBalanceRepository } from '@src/module/domain/cash-balance.entity';
import { getCashRepository } from '@src/module/domain/cash.entity';
import { getCashHistoryRepository } from '@src/module/domain/cash-history.entity';
import { getBookstoreRepository } from '@src/module/domain/bookstore.entity';
import { getPublishDefaultRepository } from '@src/module/domain/publish-default.entity';
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

  get OtpRepository() {
    return getOtpRepository(this.transaction);
  }

  get PaymentRepository() {
    return getPaymentRepository(this.transaction);
  }

  get CashBalanceRepository() {
    return getCashBalanceRepository(this.transaction);
  }

  get CashRepository() {
    return getCashRepository(this.transaction);
  }

  get CashHistoryRepository() {
    return getCashHistoryRepository(this.transaction);
  }

  get BookstoreRepository() {
    return getBookstoreRepository(this.transaction);
  }

  get PublishDefaultRepository() {
    return getPublishDefaultRepository(this.transaction);
  }
}
