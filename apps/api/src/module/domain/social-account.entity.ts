import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  DeleteDateColumn,
  EntityManager,
  IsNull,
} from 'typeorm';
import { BaseEntity } from '@src/module/shared/entity/base.entity';
import { UserEntity } from './user.entity';
import { TransactionService } from '../shared/transaction/transaction.service';
import { getEntityManager } from '@src/database/datasources';

export type SocialProvider = 'naver' | 'kakao' | 'google';

@Entity('social_accounts')
export class SocialAccountEntity extends BaseEntity {
  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => UserEntity, user => user.socialAccounts)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ type: 'varchar' })
  provider: SocialProvider;

  @Column({ type: 'varchar', name: 'account_id' })
  accountId: string;

  @DeleteDateColumn()
  deletedAt: Date;

  static create(
    userId: string,
    provider: SocialProvider,
    accountId: string
  ): SocialAccountEntity {
    const sa = new SocialAccountEntity();
    sa.userId = userId;
    sa.provider = provider;
    sa.accountId = accountId;
    return sa;
  }
}

export const getSocialAccountRepository = (
  source?: TransactionService | EntityManager
) =>
  getEntityManager(source)
    .getRepository(SocialAccountEntity)
    .extend({
      async findByUserId(userId: string): Promise<SocialAccountEntity[]> {
        return this.find({ where: { userId, deletedAt: IsNull() } });
      },

      async findByProvider(
        provider: SocialProvider,
        accountId: string
      ): Promise<SocialAccountEntity | null> {
        return this.findOne({
          where: { provider, accountId, deletedAt: IsNull() },
        });
      },

      async findByUserIdAndProvider(
        userId: string,
        provider: SocialProvider
      ): Promise<SocialAccountEntity | null> {
        return this.findOne({
          where: { userId, provider, deletedAt: IsNull() },
        });
      },
    });
