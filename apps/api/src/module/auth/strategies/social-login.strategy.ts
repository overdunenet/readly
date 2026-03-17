import type { SocialProvider } from '../../domain/social-account.entity';

export interface SocialUserProfile {
  providerId: string;
  provider: SocialProvider;
  email: string | null;
  nickname: string | null;
  profileImage: string | null;
}

export interface SocialLoginStrategy {
  getUserProfile(code: string, state: string): Promise<SocialUserProfile>;
}
