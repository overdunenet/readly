import { createFileRoute } from '@tanstack/react-router';
import tw from 'tailwind-styled-components';

export const Route = createFileRoute('/_auth/my-bookstore/analytics')({
  component: AnalyticsPage,
});

function AnalyticsPage() {
  return (
    <Container>
      <Header>
        <Title>통계</Title>
        <Period>최근 30일</Period>
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
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
        </ComingSoonIcon>
        <ComingSoonText>통계 기능 준비 중</ComingSoonText>
        <ComingSoonSubtext>
          곧 상세한 분석 데이터를 확인하실 수 있습니다
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
  flex
  items-center
  justify-between
  mb-8
`;

const Title = tw.h1`
  text-3xl
  font-bold
  text-gray-900
`;

const Period = tw.span`
  text-sm
  text-gray-600
  px-3
  py-1
  bg-gray-100
  rounded-full
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
