import { Column, DeleteDateColumn } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { BaseEntity } from '@src/module/shared/entity/base.entity';

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