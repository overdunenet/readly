import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserService, LoginResponse } from './user.service';
import { UserResponse } from './user.types';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern('user.refreshToken')
  async refreshToken(@Payload() refreshToken: string): Promise<LoginResponse> {
    return this.userService.refreshToken(refreshToken);
  }

  @MessagePattern('user.getMe')
  async getMe(@Payload() data: { userId: string }): Promise<UserResponse> {
    const user = await this.userService.getMe(data.userId);
    return {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      profileImage: user.profileImage,
      status: user.status,
    };
  }

  @MessagePattern('user.updateProfile')
  async updateProfile(
    @Payload() data: { userId: string; nickname: string }
  ): Promise<UserResponse> {
    const user = await this.userService.updateProfile(
      data.userId,
      data.nickname
    );
    return {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      profileImage: user.profileImage,
      status: user.status,
    };
  }
}
