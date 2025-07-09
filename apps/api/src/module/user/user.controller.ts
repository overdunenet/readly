import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserService, LoginCredentials, LoginResponse } from './user.service';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern('user.login')
  async login(@Payload() credentials: LoginCredentials): Promise<LoginResponse> {
    return this.userService.login(credentials);
  }

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
  }> {
    return this.userService.getMe(data.userId);
  }
}