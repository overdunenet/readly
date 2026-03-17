import { create } from 'zustand';

// API 응답과 동일한 User 타입 정의
export interface User {
  id: string;
  email: string;
  nickname: string;
  profileImage: string | null;
  phoneVerified: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  setUser: (user: User | null) => void;
  setAccessToken: (accessToken: string) => void;
  login: (data: { accessToken: string; user: User }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  setUser: (user) => set({ user }),
  setAccessToken: (accessToken) => set({ accessToken }),
  login: (data) =>
    set({
      user: data.user,
      accessToken: data.accessToken,
    }),
  logout: () =>
    set({
      user: null,
      accessToken: null,
    }),
}));
