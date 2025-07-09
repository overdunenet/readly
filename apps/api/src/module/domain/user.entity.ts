import { Column, DeleteDateColumn, EntityManager } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { BaseEntity } from '@src/module/shared/entity/base.entity';
import { TransactionService } from '../shared/transaction/transaction.service';
import {getEntityManager} from "@src/database/datasources";

export class UserEntity extends BaseEntity {
  @Column({ unique: true, type: 'varchar' })
  email: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ length: 30, type: 'varchar' })
  nickname: string;

  @Column({ type: 'varchar', nullable: true })
  profileImage: string;

  @DeleteDateColumn()
  deletedAt: Date;

  async setPassword(plainPassword: string): Promise<void> {
    this.password = await bcrypt.hash(plainPassword, 10);
  }

  async checkPassword(plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, this.password);
  }
}


export const getUserRepository = (
  source?: TransactionService | EntityManager
) =>
  getEntityManager(source)
    .getRepository(UserEntity)
    .extend({
      async register(email: string, password: string): Promise<UserEntity> {
        const admin = new UserEntity();
        admin.email = email;
        await admin.setPassword(password);
        return this.save(admin);
      },
    });
