import { createFileRoute } from '@tanstack/react-router';
import tw from 'tailwind-styled-components';

export const Route = createFileRoute('/_auth/editor/revenue')({
  component: RevenuePage,
});

function RevenuePage() {
  return (
    <Container>
      <Header>
        <Title>수익 관리</Title>
      </Header>

      <ComingSoon>
        <ComingSoonIcon>
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </ComingSoonIcon>
        <ComingSoonText>수익 관리 기능 준비 중</ComingSoonText>
        <ComingSoonSubtext>
          구독료와 포스트 판매 수익을 관리할 수 있습니다
        </ComingSoonSubtext>
      </ComingSoon>
    </Container>
  );
}

// Styled Components
const Container = tw.div`
  p-6
  lg:p-8
  max-w-7xl
  mx-auto
`;

const Header = tw.div`
  mb-8
`;

const Title = tw.h1`
  text-3xl
  font-bold
  text-gray-900
`;

const ComingSoon = tw.div`
  bg-white
  rounded-lg
  shadow
  p-16
  text-center
`;

const ComingSoonIcon = tw.div`
  mx-auto
  w-12
  h-12
  text-gray-400
  mb-4
`;

const ComingSoonText = tw.p`
  text-lg
  font-medium
  text-gray-900
  mb-2
`;

const ComingSoonSubtext = tw.p`
  text-gray-500
`;
