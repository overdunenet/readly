import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
  EntityManager,
} from 'typeorm';
import { BaseEntity } from '@src/module/shared/entity/base.entity';
import { UserEntity } from './user.entity';
import { TransactionService } from '../shared/transaction/transaction.service';
import { getEntityManager } from '@src/database/datasources';

@Entity('follows')
@Unique(['followerId', 'followeeId'])
export class FollowEntity extends BaseEntity {
  @Column({ type: 'uuid', comment: '팔로우하는 사용자 ID' })
  followerId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'follower_id' })
  follower: UserEntity;

  @Column({ type: 'uuid', comment: '팔로우 대상 사용자 ID' })
  followeeId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'followee_id' })
  followee: UserEntity;

  static create(followerId: string, followeeId: string): FollowEntity {
    const follow = new FollowEntity();
    follow.followerId = followerId;
    follow.followeeId = followeeId;
    return follow;
  }
}

export const getFollowRepository = (
  source?: TransactionService | EntityManager
) =>
  getEntityManager(source)
    .getRepository(FollowEntity)
    .extend({
      async findByFollowerAndFollowee(
        followerId: string,
        followeeId: string
      ): Promise<FollowEntity | null> {
        return this.findOneBy({ followerId, followeeId });
      },

      async countFollowers(followeeId: string): Promise<number> {
        return this.countBy({ followeeId });
      },

      async countFollowings(followerId: string): Promise<number> {
        return this.countBy({ followerId });
      },
    });
