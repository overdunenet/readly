import { UserStatus } from '../domain/user.entity';

export interface UserResponse {
  id: string;
  email: string;
  nickname: string;
  profileImage: string | null;
  status: UserStatus;
  language: string;
}
