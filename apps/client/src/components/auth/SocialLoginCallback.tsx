import { Link } from '@tanstack/react-router';
import tw from 'tailwind-styled-components';

export type SocialProvider = 'kakao' | 'naver';

interface SocialProviderConfig {
  name: string;
  brandColor: string;
  iconLetter: string;
  iconTextColor: string;
}

const PROVIDER_CONFIG: Record<SocialProvider, SocialProviderConfig> = {
  kakao: {
    name: '카카오',
    brandColor: '#FEE500',
    iconLetter: 'K',
    iconTextColor: '#000000',
  },
  naver: {
    name: '네이버',
    brandColor: '#03C75A',
    iconLetter: 'N',
    iconTextColor: 'white',
  },
};

interface SocialLoginCallbackProps {
  provider: SocialProvider;
  isLoading: boolean;
  error: string | null;
}

export function SocialLoginCallback({
  provider,
  isLoading,
  error,
}: SocialLoginCallbackProps) {
  const config = PROVIDER_CONFIG[provider];

  if (isLoading && !error) {
    return (
      <Container>
        <Card>
          <div
            className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full text-xl font-bold"
            style={{
              backgroundColor: config.brandColor,
              color: config.iconTextColor,
            }}
          >
            {config.iconLetter}
          </div>
          <Title>{config.name} 로그인 처리 중</Title>
          <SubText>잠시만 기다려주세요...</SubText>
          <div
            className="mx-auto h-8 w-8 animate-spin rounded-full border-4"
            style={{
              borderColor: `${config.brandColor}4D`,
              borderTopColor: config.brandColor,
            }}
          />
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
