import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserService, LoginResponse } from './user.service';
import { UserStatus } from '../domain/user.entity';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern('user.refreshToken')
  async refreshToken(@Payload() refreshToken: string): Promise<LoginResponse> {
    return this.userService.refreshToken(refreshToken);
  }

  @MessagePattern('user.getMe')
  async getMe(@Payload() data: { userId: string }): Promise<{
    id: string;
    email: string;
    nickname: string;
    profileImage: string | null;
    status: UserStatus;
  }> {
    return this.userService.getMe(data.userId);
  }

  @MessagePattern('user.updateProfile')
  async updateProfile(@Payload() data: { userId: string; nickname: string }) {
    return this.userService.updateProfile(data.userId, data.nickname);
  }
}
