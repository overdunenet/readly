import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';

import { useAuthStore } from '../stores/auth';

import { trpc } from '@/shared';

export const useAuth = () => {
  const navigate = useNavigate();
  const { user, accessToken, logout: storeLogout, setUser } = useAuthStore();

  // 사용자 정보 조회 (accessToken이 있지만 user 정보가 없는 경우)
  const { data: userData, isLoading } = trpc.user.me.useQuery(undefined, {
    enabled: !!accessToken && !user,
    retry: false,
  });

  // 로그아웃 mutation
  const logoutMutation = trpc.user.logout.useMutation();

  useEffect(() => {
    if (userData && !user) {
      setUser(userData);
    }
  }, [userData, user, setUser]);

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
    logout: handleLogout,
  };
};
