import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import tw from 'tailwind-styled-components';

import { useAuthStore } from '../../../stores/auth';

import { trpc } from '@/shared';

export const Route = createFileRoute('/auth/naver/callback')({
  component: NaverCallbackPage,
});

function NaverCallbackPage() {
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
        setError('네이버 로그인이 취소되었습니다');
        setIsLoading(false);
        return;
      }

      if (!code || !state) {
        setError('잘못된 인증 응답입니다');
        setIsLoading(false);
        return;
      }

      // state 검증
      const savedState = sessionStorage.getItem('naver_oauth_state');
      if (savedState !== state) {
        setError('인증 상태가 유효하지 않습니다');
        setIsLoading(false);
        return;
      }
      sessionStorage.removeItem('naver_oauth_state');

      // 소셜 로그인 API 호출
      socialLoginMutation
        .mutateAsync({
          provider: 'naver',
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
            err instanceof Error ? err.message : '네이버 로그인에 실패했습니다';
          setError(message);
          setIsLoading(false);
        });
    };

    handleCallback();
  }, []);

  if (isLoading && !error) {
    return (
      <Container>
        <Card>
          <NaverIcon />
          <Title>네이버 로그인 처리 중</Title>
          <SubText>잠시만 기다려주세요...</SubText>
          <NaverSpinner />
        </Card>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Card>
          <Title>로그인 실패</Title>
          <ErrorMessage>{error}</ErrorMessage>
          <StyledLink to="/login">로그인 페이지로 돌아가기</StyledLink>
        </Card>
      </Container>
    );
  }

  return null;
}

// Styled Components
const Container = tw.div`
  min-h-screen
  flex
  items-center
  justify-center
  bg-gray-50
`;

const Card = tw.div`
  bg-white
  p-8
  rounded-lg
  shadow-md
  w-full
  max-w-md
  text-center
`;

const Title = tw.h2`
  text-xl
  font-semibold
  text-gray-800
  mb-4
`;

const ErrorMessage = tw.p`
  text-red-600
  mb-4
`;

const StyledLink = tw(Link)`
  text-blue-600
  hover:text-blue-800
  font-medium
`;

const SubText = tw.p`
  text-sm
  text-gray-500
  mb-6
`;

const NaverIcon = tw.div`
  w-12
  h-12
  rounded-full
  bg-[#03C75A]
  mx-auto
  mb-4
  flex
  items-center
  justify-center
  text-xl
  font-bold
  text-white
  before:content-['N']
`;

const NaverSpinner = tw.div`
  w-8
  h-8
  border-4
  border-[#03C75A]/30
  border-t-[#03C75A]
  rounded-full
  animate-spin
  mx-auto
`;
