import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { FollowService } from './follow.service';
import { FollowEntity } from '../domain/follow.entity';

@Controller()
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @MessagePattern('follow.follow')
  async follow(
    @Payload() data: { followerId: string; followeeId: string }
  ): Promise<FollowEntity> {
    return this.followService.follow(data.followerId, data.followeeId);
  }

  @MessagePattern('follow.unfollow')
  async unfollow(
    @Payload() data: { followerId: string; followeeId: string }
  ): Promise<void> {
    return this.followService.unfollow(data.followerId, data.followeeId);
  }

  @MessagePattern('follow.isFollowing')
  async isFollowing(
    @Payload() data: { followerId: string; followeeId: string }
  ): Promise<boolean> {
    return this.followService.isFollowing(data.followerId, data.followeeId);
  }

  @MessagePattern('follow.getFollowerCount')
  async getFollowerCount(@Payload() data: { userId: string }): Promise<number> {
    return this.followService.getFollowerCount(data.userId);
  }

  @MessagePattern('follow.getFollowingCount')
  async getFollowingCount(
    @Payload() data: { userId: string }
  ): Promise<number> {
    return this.followService.getFollowingCount(data.userId);
  }
}
