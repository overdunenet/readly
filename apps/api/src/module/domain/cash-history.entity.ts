import { Entity, Column, ManyToOne, JoinColumn, EntityManager } from 'typeorm';
import { BaseEntity } from '@src/module/shared/entity/base.entity';
import { CashEntity } from './cash.entity';
import { UserEntity } from './user.entity';
import { TransactionService } from '../shared/transaction/transaction.service';
import { getEntityManager } from '@src/database/datasources';

@Entity('cash_history')
export class CashHistoryEntity extends BaseEntity {
  @Column({ type: 'uuid', comment: '캐시 ID' })
  cashId: string;

  @Column({ type: 'uuid', comment: '사용자 ID' })
  userId: string;

  @Column({
    type: 'varchar',
    length: 20,
    comment: '변동 유형 (CHARGE/PURCHASE/REFUND)',
  })
  type: string;

  @Column({ type: 'integer', comment: '변동 금액' })
  amount: number;

  @Column({ type: 'integer', comment: '변동 후 잔액' })
  balanceAfter: number;

  @Column({ type: 'varchar', length: 200, comment: '설명' })
  description: string;

  @ManyToOne(() => CashEntity)
  @JoinColumn({ name: 'cash_id' })
  cash: CashEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  static create(
    cashId: string,
    userId: string,
    type: string,
    amount: number,
    balanceAfter: number,
    description: string
  ): CashHistoryEntity {
    const history = new CashHistoryEntity();
    history.cashId = cashId;
    history.userId = userId;
    history.type = type;
    history.amount = amount;
    history.balanceAfter = balanceAfter;
    history.description = description;
    return history;
  }
}

export const getCashHistoryRepository = (
  source?: TransactionService | EntityManager
) => getEntityManager(source).getRepository(CashHistoryEntity).extend({});
