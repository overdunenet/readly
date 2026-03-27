import { createFileRoute, Link, useSearch } from '@tanstack/react-router';
import { useState } from 'react';
import tw from 'tailwind-styled-components';
import { z } from 'zod';

const loginSearchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute('/login')({
  validateSearch: loginSearchSchema,
  component: LoginPage,
});

function LoginPage() {
  const { redirect } = useSearch({ from: '/login' });
  const [error, setError] = useState<string | null>(null);

  const saveRedirect = () => {
    if (redirect) {
      sessionStorage.setItem('login_redirect', redirect);
    }
  };

  const handleNaverLogin = () => {
    setError(null);
    saveRedirect();
    const clientId = import.meta.env.VITE_NAVER_CLIENT_ID;
    if (!clientId) {
      setError('네이버 로그인을 시작할 수 없습니다');
      return;
    }

    const callbackUrl = encodeURIComponent(
      import.meta.env.VITE_NAVER_CALLBACK_URL ||
        `${window.location.origin}/auth/naver/callback`,
    );
    const state = crypto.randomUUID();
    sessionStorage.setItem('naver_oauth_state', state);

    window.location.href = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${clientId}&redirect_uri=${callbackUrl}&state=${state}`;
  };

  const handleKakaoLogin = () => {
    setError(null);
    saveRedirect();
    const clientId = import.meta.env.VITE_KAKAO_CLIENT_ID;
    if (!clientId) {
      setError('카카오 로그인을 시작할 수 없습니다');
      return;
    }

    const callbackUrl = encodeURIComponent(
      import.meta.env.VITE_KAKAO_CALLBACK_URL ||
        `${window.location.origin}/auth/kakao/callback`,
    );
    const state = crypto.randomUUID();
    sessionStorage.setItem('kakao_oauth_state', state);

    window.location.href = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${callbackUrl}&state=${state}`;
  };

  return (
    <Container>
      <FormCard>
        <Logo to="/">Readly</Logo>

        <Title>로그인</Title>

        {error && <AlertBox>{error}</AlertBox>}

        <SocialLoginSection>
          <NaverLoginButton
            type="button"
            style={{ backgroundColor: '#03C75A' }}
            onClick={handleNaverLogin}
          >
            네이버로 로그인
          </NaverLoginButton>
          <KakaoLoginButton
            type="button"
            style={{ backgroundColor: '#FEE500', color: '#000000' }}
            onClick={handleKakaoLogin}
          >
            카카오로 시작하기
          </KakaoLoginButton>
        </SocialLoginSection>
      </FormCard>
    </Container>
  );
}

// Styled Components
const Container = tw.div`
  min-h-screen
  bg-gray-50
  flex
  items-center
  justify-center
  px-4
  py-12
`;

const FormCard = tw.div`
  w-full
  max-w-md
  bg-white
  rounded-lg
  shadow-lg
  p-8
`;

const Logo = tw(Link)`
  block
  text-2xl
  font-bold
  text-center
  text-gray-900
  mb-8
  no-underline
`;

const Title = tw.h1`
  text-2xl
  font-semibold
  text-center
  text-gray-900
  mb-6
`;

const AlertBox = tw.div`
  p-3
  bg-red-50
  border
  border-red-200
  rounded-md
  text-sm
  text-red-700
  mb-4
`;

const SocialLoginSection = tw.div`
  flex
  flex-col
  gap-3
  w-full
`;

const NaverLoginButton = tw.button`
  w-full
  py-3
  rounded-lg
  text-white
  font-medium
  flex
  items-center
  justify-center
  gap-2
  transition-colors
  duration-200
  hover:opacity-90
  cursor-pointer
`;

const KakaoLoginButton = tw.button`
  w-full
  py-3
  rounded-lg
  font-medium
  flex
  items-center
  justify-center
  gap-2
  transition-colors
  duration-200
  hover:opacity-90
  cursor-pointer
`;
