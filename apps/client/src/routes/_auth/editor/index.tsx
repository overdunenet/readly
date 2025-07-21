import { createFileRoute } from '@tanstack/react-router';
import tw from 'tailwind-styled-components';

export const Route = createFileRoute('/_auth/editor/')({
  component: Dashboard,
});

function Dashboard() {
  return (
    <Container>
      <Header>
        <Title>대시보드</Title>
        <Subtitle>에디터 활동 개요</Subtitle>
      </Header>

      <Grid>
        <Card>
          <CardHeader>
            <CardTitle>총 포스트</CardTitle>
            <CardIcon>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </CardIcon>
          </CardHeader>
          <CardValue>0</CardValue>
          <CardDescription>작성한 포스트</CardDescription>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>총 조회수</CardTitle>
            <CardIcon>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </CardIcon>
          </CardHeader>
          <CardValue>0</CardValue>
          <CardDescription>전체 조회수</CardDescription>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>구독자</CardTitle>
            <CardIcon>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </CardIcon>
          </CardHeader>
          <CardValue>0</CardValue>
          <CardDescription>구독자 수</CardDescription>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>수익</CardTitle>
            <CardIcon>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </CardIcon>
          </CardHeader>
          <CardValue>₩0</CardValue>
          <CardDescription>이번 달 수익</CardDescription>
        </Card>
      </Grid>

      <Section>
        <SectionHeader>
          <SectionTitle>최근 활동</SectionTitle>
        </SectionHeader>
        <EmptyState>
          <EmptyIcon>
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="9" y1="9" x2="15" y2="9" />
              <line x1="9" y1="12" x2="15" y2="12" />
              <line x1="9" y1="15" x2="12" y2="15" />
            </svg>
          </EmptyIcon>
          <EmptyText>아직 활동 내역이 없습니다</EmptyText>
          <EmptySubtext>포스트를 작성하면 여기에 표시됩니다</EmptySubtext>
        </EmptyState>
      </Section>
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
  mb-2
`;

const Subtitle = tw.p`
  text-gray-600
`;

const Grid = tw.div`
  grid
  grid-cols-1
  md:grid-cols-2
  lg:grid-cols-4
  gap-6
  mb-8
`;

const Card = tw.div`
  bg-white
  rounded-lg
  shadow
  p-6
`;

const CardHeader = tw.div`
  flex
  items-center
  justify-between
  mb-4
`;

const CardTitle = tw.h3`
  text-sm
  font-medium
  text-gray-600
`;

const CardIcon = tw.div`
  text-gray-400
`;

const CardValue = tw.p`
  text-2xl
  font-bold
  text-gray-900
  mb-1
`;

const CardDescription = tw.p`
  text-sm
  text-gray-500
`;

const Section = tw.section`
  bg-white
  rounded-lg
  shadow
`;

const SectionHeader = tw.div`
  p-6
  border-b
  border-gray-200
`;

const SectionTitle = tw.h2`
  text-lg
  font-semibold
  text-gray-900
`;

const EmptyState = tw.div`
  p-12
  text-center
`;

const EmptyIcon = tw.div`
  mx-auto
  w-12
  h-12
  text-gray-400
  mb-4
`;

const EmptyText = tw.p`
  text-gray-900
  font-medium
  mb-2
`;

const EmptySubtext = tw.p`
  text-sm
  text-gray-500
`;
