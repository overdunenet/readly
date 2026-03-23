import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Check,
  EntityManager,
} from 'typeorm';
import { BaseEntity } from '@src/module/shared/entity/base.entity';
import { UserEntity } from './user.entity';
import { TransactionService } from '../shared/transaction/transaction.service';
import { getEntityManager } from '@src/database/datasources';

@Entity('cash')
@Check('CHK_cash_current_amount', '"current_amount" >= 0')
export class CashEntity extends BaseEntity {
  @Column({ type: 'uuid', comment: '캐시 소유 사용자 ID' })
  userId: string;

  @Column({ type: 'integer', comment: '최초 충전 금액' })
  initialAmount: number;

  @Column({ type: 'integer', comment: '잔여 금액' })
  currentAmount: number;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  static create(userId: string, amount: number): CashEntity {
    const cash = new CashEntity();
    cash.userId = userId;
    cash.initialAmount = amount;
    cash.currentAmount = amount;
    return cash;
  }
}

export const getCashRepository = (
  source?: TransactionService | EntityManager
) => getEntityManager(source).getRepository(CashEntity).extend({});
