import {
  Column,
  DeleteDateColumn,
  EntityManager,
  Entity,
  OneToMany,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { BaseEntity } from '@src/module/shared/entity/base.entity';
import { SocialAccountEntity } from './social-account.entity';
import { TransactionService } from '../shared/transaction/transaction.service';
import { getEntityManager } from '@src/database/datasources';

@Entity('users')
export class UserEntity extends BaseEntity {
  @Column({ unique: true, type: 'varchar' })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  password: string | null;

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

  async setPassword(plainPassword: string): Promise<void> {
    this.password = await bcrypt.hash(plainPassword, 10);
  }

  async checkPassword(plainPassword: string): Promise<boolean> {
    if (!this.password) return false;
    return bcrypt.compare(plainPassword, this.password);
  }

  static async register(input: {
    email: string;
    password: string;
    nickname: string;
  }): Promise<UserEntity> {
    const user = new UserEntity();
    user.email = input.email;
    user.nickname = input.nickname;
    await user.setPassword(input.password);
    return user;
  }
}

export const getUserRepository = (
  source?: TransactionService | EntityManager
) =>
  getEntityManager(source)
    .getRepository(UserEntity)
    .extend({
      async register(input: {
        email: string;
        password: string;
        nickname: string;
      }): Promise<UserEntity> {
        const user = await UserEntity.register(input);
        return this.save(user);
      },
    });
