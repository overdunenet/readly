import type { AppRouter } from '@readly/api-types/src/server';
import { createTRPCClient, httpLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';

import { useAuthStore } from '../../stores/auth';

// Token refresh function
const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/trpc/user.refreshToken`,
      {
        method: 'POST',
        credentials: 'include', // 쿠키 포함
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      },
    );

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    const result = data.result?.data;
    const newAccessToken = result?.accessToken;

    if (newAccessToken && result?.user) {
      // AuthStore에 새 토큰과 사용자 정보 저장
      useAuthStore.getState().setAccessToken(newAccessToken);
      useAuthStore.getState().setUser(result.user);
      return newAccessToken;
    }

    return null;
  } catch (error) {
    console.error('Token refresh error:', error);
    // Refresh 실패 시 로그아웃
    useAuthStore.getState().logout();
    return null;
  }
};

export const trpc = createTRPCReact<AppRouter>();

const customFetch: typeof globalThis.fetch = async (url, options) => {
  const makeRequest = async (token?: string | null): Promise<Response> =>
    fetch(url, {
      ...options,
      credentials: 'include', // 쿠키를 포함하여 요청
      headers: {
        ...options?.headers,
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

  // 첫 번째 시도
  const token = useAuthStore.getState().accessToken;
  const response = await makeRequest(token);

  // 401 에러인 경우 토큰 refresh 시도
  if (response.status === 401 && token) {
    console.log('토큰 만료 감지, refresh 시도 중...');

    const newToken = await refreshAccessToken();

    if (newToken) {
      console.log('토큰 refresh 성공, 재시도 중...');
      // 새 토큰으로 재시도
      const retryResponse = await makeRequest(newToken);
      return retryResponse;
    } else {
      console.log('토큰 refresh 실패');
      // Refresh 실패 시 원래 response 반환 (로그아웃은 refreshAccessToken에서 처리)
      return response;
    }
  }

  return response;
};

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/trpc`,
      fetch: customFetch,
    }),
  ],
});

// React hooks 외부에서 사용 가능한 standalone tRPC client
// trpcClient와 동일한 인증/토큰 갱신 로직 적용
export const vanillaTrpcClient = createTRPCClient<AppRouter>({
  links: [
    httpLink({
      url: `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/trpc`,
      fetch: customFetch,
    }),
  ],
});
