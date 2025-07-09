import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserService, LoginCredentials, LoginResponse } from './user.service';
import { UserEntity } from '../domain/user.entity';

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

  @MessagePattern('user.validateToken')
  async validateToken(@Payload() token: string): Promise<UserEntity> {
    return this.userService.validateToken(token);
  }
}