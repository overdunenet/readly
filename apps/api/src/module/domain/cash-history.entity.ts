import { Entity, Column, ManyToOne, JoinColumn, EntityManager } from 'typeorm';
import { BaseEntity } from '@src/module/shared/entity/base.entity';
import { CashEntity } from './cash.entity';
import { UserEntity } from './user.entity';
import { TransactionService } from '../shared/transaction/transaction.service';
import { getEntityManager } from '@src/database/datasources';

export enum CashHistoryType {
  CHARGE = 'CHARGE',
  PURCHASE = 'PURCHASE',
  REFUND = 'REFUND',
}

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
  type: CashHistoryType;

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

  static create(input: {
    cashId: string;
    userId: string;
    type: CashHistoryType;
    amount: number;
    balanceAfter: number;
    description: string;
  }): CashHistoryEntity {
    const entity = new CashHistoryEntity();
    entity.cashId = input.cashId;
    entity.userId = input.userId;
    entity.type = input.type;
    entity.amount = input.amount;
    entity.balanceAfter = input.balanceAfter;
    entity.description = input.description;
    return entity;
  }
}

export const getCashHistoryRepository = (
  source?: TransactionService | EntityManager
) => getEntityManager(source).getRepository(CashHistoryEntity).extend({});
