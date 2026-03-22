import { Entity, Column, ManyToOne, JoinColumn, EntityManager } from 'typeorm';
import { BaseEntity } from '@src/module/shared/entity/base.entity';
import { UserEntity } from './user.entity';
import { TransactionService } from '../shared/transaction/transaction.service';
import { getEntityManager } from '@src/database/datasources';

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

@Entity('payments')
export class PaymentEntity extends BaseEntity {
  @Column({ type: 'uuid', comment: '결제한 사용자 ID' })
  userId: string;

  @Column({
    type: 'varchar',
    length: 64,
    nullable: true,
    comment: 'PG 거래 ID',
  })
  pgTid: string | null;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'nicepay',
    comment: 'PG 제공사',
  })
  pgProvider: string;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
    comment: '결제수단',
  })
  method: string | null;

  @Column({ type: 'integer', comment: '결제 금액' })
  amount: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: PaymentStatus.PENDING,
    comment: '결제 상태 (PENDING/PAID/FAILED/CANCELLED)',
  })
  status: PaymentStatus;

  @Column({ type: 'text', nullable: true, comment: '실패 사유' })
  failReason: string | null;

  @Column({
    type: 'timestamptz',
    nullable: true,
    comment: '결제 승인 일시',
  })
  paidAt: Date | null;

  @Column({
    type: 'timestamptz',
    nullable: true,
    comment: '결제 취소 일시',
  })
  cancelledAt: Date | null;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  static create(userId: string, amount: number): PaymentEntity {
    const payment = new PaymentEntity();
    payment.userId = userId;
    payment.amount = amount;
    return payment;
  }
}

export const getPaymentRepository = (
  source?: TransactionService | EntityManager
) => getEntityManager(source).getRepository(PaymentEntity).extend({});
