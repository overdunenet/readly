import { UserStatus } from '../domain/user.entity';
import { Language } from '../domain/enums';

export interface UserResponse {
  id: string;
  email: string;
  nickname: string;
  profileImage: string | null;
  status: UserStatus;
  language: Language;
}
