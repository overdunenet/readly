import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  DeleteDateColumn,
  EntityManager,
} from 'typeorm';
import { BaseEntity } from '@src/module/shared/entity/base.entity';
import { UserEntity } from './user.entity';
import { TransactionService } from '../shared/transaction/transaction.service';
import { getEntityManager } from '@src/database/datasources';

@Entity('social_accounts')
export class SocialAccountEntity extends BaseEntity {
  @Column({ type: 'uuid' })
  userId: string;

  @OneToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ type: 'varchar', nullable: true })
  naverId: string | null;

  @Column({ type: 'varchar', nullable: true })
  kakaoId: string | null;

  @Column({ type: 'varchar', nullable: true })
  googleId: string | null;

  @DeleteDateColumn()
  deletedAt: Date;

  static create(userId: string): SocialAccountEntity {
    const socialAccount = new SocialAccountEntity();
    socialAccount.userId = userId;
    return socialAccount;
  }
}

export const getSocialAccountRepository = (
  source?: TransactionService | EntityManager
) =>
  getEntityManager(source)
    .getRepository(SocialAccountEntity)
    .extend({
      async findByUserId(userId: string): Promise<SocialAccountEntity | null> {
        return this.findOneBy({ userId });
      },

      async findByProvider(
        provider: 'naver' | 'kakao' | 'google',
        providerId: string
      ): Promise<SocialAccountEntity | null> {
        if (provider === 'naver')
          return this.findOneBy({ naverId: providerId });
        if (provider === 'kakao')
          return this.findOneBy({ kakaoId: providerId });
        if (provider === 'google')
          return this.findOneBy({ googleId: providerId });
        return null;
      },
    });
