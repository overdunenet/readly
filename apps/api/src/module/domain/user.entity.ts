import {
  Column,
  DeleteDateColumn,
  EntityManager,
  Entity,
  Index,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '@src/module/shared/entity/base.entity';
import { SocialAccountEntity } from './social-account.entity';
import { TransactionService } from '../shared/transaction/transaction.service';
import { getEntityManager } from '@src/database/datasources';

export enum UserStatus {
  PENDING_PHONE = 'PENDING_PHONE',
  PENDING_PROFILE = 'PENDING_PROFILE',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Index('IDX_users_nickname_unique', ['nickname'], {
  unique: true,
  where: '"deletedAt" IS NULL',
})
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

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.PENDING_PHONE,
  })
  status: UserStatus;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany(() => SocialAccountEntity, socialAccount => socialAccount.user)
  socialAccounts: SocialAccountEntity[];

  private static readonly ALLOWED_TRANSITIONS: Record<
    UserStatus,
    UserStatus[]
  > = {
    [UserStatus.PENDING_PHONE]: [UserStatus.PENDING_PROFILE],
    [UserStatus.PENDING_PROFILE]: [UserStatus.ACTIVE],
    [UserStatus.ACTIVE]: [UserStatus.INACTIVE],
    [UserStatus.INACTIVE]: [],
  };

  updateStatus(nextStatus: UserStatus): void {
    const allowed = UserEntity.ALLOWED_TRANSITIONS[this.status];
    if (!allowed.includes(nextStatus)) {
      throw new Error(
        `${this.status} 상태에서 ${nextStatus} 상태로 변경할 수 없습니다`
      );
    }
    this.status = nextStatus;
  }
}

export const getUserRepository = (
  source?: TransactionService | EntityManager
) => getEntityManager(source).getRepository(UserEntity);
