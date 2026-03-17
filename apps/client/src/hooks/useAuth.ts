import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';

import { useAuthStore } from '../stores/auth';

import { trpc } from '@/shared';

export const useAuth = () => {
  const navigate = useNavigate();
  const {
    user,
    accessToken,
    login: storeLogin,
    logout: storeLogout,
    setUser,
  } = useAuthStore();

  // 사용자 정보 조회 (accessToken이 있지만 user 정보가 없는 경우)
  const { data: userData, isLoading } = trpc.user.me.useQuery(undefined, {
    enabled: !!accessToken && !user,
    retry: false,
  });

  // 로그인 mutation
  const loginMutation = trpc.user.login.useMutation();

  // 로그아웃 mutation
  const logoutMutation = trpc.user.logout.useMutation();

  useEffect(() => {
    if (userData && !user) {
      setUser(userData);
    }
  }, [userData, user, setUser]);

  const handleLogin = async (email: string, password: string) => {
    const response = await loginMutation.mutateAsync({ email, password });
    storeLogin({
      accessToken: response.accessToken,
      user: response.user,
    });

    // phoneVerified 여부에 따라 리다이렉트
    navigate({ to: response.user.phoneVerified ? '/' : '/phone-verify' });

    return response;
  };

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync({});
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      storeLogout();
      navigate({ to: '/' });
    }
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login: handleLogin,
    logout: handleLogout,
  };
};
