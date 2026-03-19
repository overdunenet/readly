import {
  Column,
  DeleteDateColumn,
  EntityManager,
  Entity,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '@src/module/shared/entity/base.entity';
import { SocialAccountEntity } from './social-account.entity';
import { TransactionService } from '../shared/transaction/transaction.service';
import { getEntityManager } from '@src/database/datasources';

@Entity('users')
export class UserEntity extends BaseEntity {
  @Column({ unique: true, type: 'varchar' })
  email: string;

  @Column({ length: 30, type: 'varchar' })
  nickname: string;

  @Column({ type: 'varchar', nullable: true })
  profileImage: string | null;

  @Column({ type: 'varchar', nullable: true })
  phone: string | null;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany(() => SocialAccountEntity, socialAccount => socialAccount.user)
  socialAccounts: SocialAccountEntity[];
}

export const getUserRepository = (
  source?: TransactionService | EntityManager
) => getEntityManager(source).getRepository(UserEntity);
