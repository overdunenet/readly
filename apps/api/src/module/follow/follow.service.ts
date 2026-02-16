import { Injectable, BadRequestException } from '@nestjs/common';
import { RepositoryProvider } from '../shared/transaction/repository.provider';
import { FollowEntity } from '../domain/follow.entity';

@Injectable()
export class FollowService {
  constructor(private readonly repositoryProvider: RepositoryProvider) {}

  async follow(followerId: string, followeeId: string): Promise<FollowEntity> {
    if (followerId === followeeId) {
      throw new BadRequestException('Cannot follow yourself');
    }

    return this.repositoryProvider.FollowRepository.follow(
      followerId,
      followeeId
    );
  }

  async unfollow(followerId: string, followeeId: string): Promise<void> {
    return this.repositoryProvider.FollowRepository.unfollow(
      followerId,
      followeeId
    );
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
