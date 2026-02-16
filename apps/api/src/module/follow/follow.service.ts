import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { RepositoryProvider } from '../shared/transaction/repository.provider';
import { FollowEntity } from '../domain/follow.entity';

@Injectable()
export class FollowService {
  constructor(private readonly repositoryProvider: RepositoryProvider) {}

  async follow(followerId: string, followeeId: string): Promise<FollowEntity> {
    if (followerId === followeeId) {
      throw new BadRequestException('Cannot follow yourself');
    }

    const existing = await this.repositoryProvider.FollowRepository.findOneBy({
      followerId,
      followeeId,
    });

    if (existing) {
      throw new ConflictException('Already following this user');
    }

    const follow = FollowEntity.create(followerId, followeeId);
    return this.repositoryProvider.FollowRepository.save(follow);
  }

  async unfollow(followerId: string, followeeId: string): Promise<void> {
    const follow =
      await this.repositoryProvider.FollowRepository.findOneByOrFail({
        followerId,
        followeeId,
      }).catch(() => {
        throw new NotFoundException('Not following this user');
      });

    await this.repositoryProvider.FollowRepository.remove(follow);
  }

  async isFollowing(followerId: string, followeeId: string): Promise<boolean> {
    const follow = await this.repositoryProvider.FollowRepository.findOneBy({
      followerId,
      followeeId,
    });
    return !!follow;
  }

  async getFollowerCount(userId: string): Promise<number> {
    return this.repositoryProvider.FollowRepository.countFollowers(userId);
  }

  async getFollowingCount(userId: string): Promise<number> {
    return this.repositoryProvider.FollowRepository.countFollowings(userId);
  }
}
