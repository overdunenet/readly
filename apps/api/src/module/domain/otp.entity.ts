import { Entity, Column, EntityManager } from 'typeorm';
import { BaseEntity } from '@src/module/shared/entity/base.entity';
import { TransactionService } from '../shared/transaction/transaction.service';
import { getEntityManager } from '@src/database/datasources';

@Entity('otp_verifications')
export class OtpEntity extends BaseEntity {
  @Column({ type: 'varchar' })
  phone: string;

  @Column({ type: 'varchar', length: 6 })
  code: string;

  @Column({ type: 'timestamp' })
  expiresAt: Date;
}

export const getOtpRepository = (source?: TransactionService | EntityManager) =>
  getEntityManager(source)
    .getRepository(OtpEntity)
    .extend({
      async findByPhone(phone: string): Promise<OtpEntity | null> {
        return this.findOneBy({ phone });
      },

      async deleteByPhone(phone: string): Promise<void> {
        await this.delete({ phone });
      },
    });
