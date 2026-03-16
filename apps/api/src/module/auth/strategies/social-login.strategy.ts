export type SocialProvider = 'naver' | 'kakao' | 'google';

export interface SocialUserProfile {
  providerId: string;
  provider: SocialProvider;
  email: string | null;
  nickname: string | null;
  profileImage: string | null;
}

export interface SocialLoginStrategy {
  getAccessToken(code: string, state: string): Promise<string>;
  getUserProfile(accessToken: string): Promise<SocialUserProfile>;
}
