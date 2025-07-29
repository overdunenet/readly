import { createFileRoute, useNavigate } from '@tanstack/react-router';
import tw from 'tailwind-styled-components';

export const Route = createFileRoute('/_auth/editor/posts/')({
  component: PostsPage,
});

function PostsPage() {
  const navigate = useNavigate();

  return (
    <Container>
      <Header>
        <Title>포스트 관리</Title>
        <CreateButton onClick={() => navigate({ to: '/editor/posts/create' })}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          새 포스트
        </CreateButton>
      </Header>

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
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        </EmptyIcon>
        <EmptyText>아직 작성한 포스트가 없습니다</EmptyText>
        <EmptySubtext>첫 번째 포스트를 작성해보세요</EmptySubtext>
      </EmptyState>
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

const CreateButton = tw.button`
  flex
  items-center
  gap-2
  px-4
  py-2
  bg-blue-600
  text-white
  font-medium
  rounded-lg
  hover:bg-blue-700
  transition-colors
`;

const EmptyState = tw.div`
  bg-white
  rounded-lg
  shadow
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
