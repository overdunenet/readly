import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  EntityManager,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { TransactionService } from '../shared/transaction/transaction.service';
import { getEntityManager } from '@src/database/datasources';

@Entity('cash_balances')
export class CashBalanceEntity {
  @PrimaryColumn({ type: 'uuid', comment: '사용자 ID (PK이자 FK)' })
  userId: string;

  @Column({ type: 'integer', default: 0, comment: '현재 잔액' })
  amount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  static create(userId: string): CashBalanceEntity {
    const balance = new CashBalanceEntity();
    balance.userId = userId;
    balance.amount = 0;
    return balance;
  }
}

export const getCashBalanceRepository = (
  source?: TransactionService | EntityManager
) => getEntityManager(source).getRepository(CashBalanceEntity).extend({});
