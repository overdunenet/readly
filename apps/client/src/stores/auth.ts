import { create } from 'zustand';

import type { inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '@readly/api-types/src/server';

type RouterOutputs = inferRouterOutputs<AppRouter>;
type UserFromRouter = RouterOutputs['user']['me'];

export type UserStatus = UserFromRouter['status'];
export type User = UserFromRouter;

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
