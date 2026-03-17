import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';

import { useAuthStore } from '../../../stores/auth';

import { SocialLoginCallback } from '@/components/auth/SocialLoginCallback';
import { trpc } from '@/shared';

export const Route = createFileRoute('/auth/kakao/callback')({
  component: KakaoCallbackPage,
});

function KakaoCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const socialLoginMutation = trpc.auth.socialLogin.useMutation();
  const isProcessed = useRef(false);

  useEffect(() => {
    if (isProcessed.current) return;
    isProcessed.current = true;

    const handleCallback = () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const state = params.get('state');
      const errorParam = params.get('error');

      if (errorParam) {
        setError('카카오 로그인이 취소되었습니다');
        setIsLoading(false);
        return;
      }

      if (!code || !state) {
        setError('잘못된 인증 응답입니다');
        setIsLoading(false);
        return;
      }

      // state 검증
      const savedState = sessionStorage.getItem('kakao_oauth_state');
      if (savedState !== state) {
        setError('인증 상태가 유효하지 않습니다');
        setIsLoading(false);
        return;
      }
      sessionStorage.removeItem('kakao_oauth_state');

      // 소셜 로그인 API 호출
      socialLoginMutation
        .mutateAsync({
          provider: 'kakao',
          code,
          state,
        })
        .then((result) => {
          useAuthStore.getState().login({
            accessToken: result.accessToken,
            user: result.user,
          });
          navigate({ to: '/' });
        })
        .catch((err: unknown) => {
          const message =
            err instanceof Error ? err.message : '카카오 로그인에 실패했습니다';
          setError(message);
          setIsLoading(false);
        });
    };

    handleCallback();
  }, []);

  return (
    <SocialLoginCallback provider="kakao" isLoading={isLoading} error={error} />
  );
}
