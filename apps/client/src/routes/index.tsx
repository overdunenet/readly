import { createFileRoute } from '@tanstack/react-router';
import tw from 'tailwind-styled-components';

import FeedCard from '../components/feed/FeedCard';
import Layout from '../components/layout/Layout';

import { trpc } from '@/shared';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  const { data: posts, isLoading } = trpc.post.getAccessible.useQuery();

  return (
    <Layout>
      <FeedContainer>
        {isLoading ? (
          <LoadingContainer>
            <LoadingText>로딩 중...</LoadingText>
          </LoadingContainer>
        ) : !posts || posts.length === 0 ? (
          <EmptyContainer>
            <EmptyText>아직 등록된 포스트가 없습니다.</EmptyText>
          </EmptyContainer>
        ) : (
          <FeedList>
            {posts.map((post) => (
              <FeedCard
                key={post.id}
                authorId={post.author.id}
                author={post.author.nickname}
                authorAvatar={post.author.profileImage ?? undefined}
                title={post.title}
                excerpt={post.excerpt}
                thumbnail={post.thumbnail}
                publishedAt={post.publishedAt ?? null}
              />
            ))}
          </FeedList>
        )}
      </FeedContainer>
    </Layout>
  );
}

// Styled Components
const FeedContainer = tw.div`
  min-h-screen
  bg-white
`;

const FeedList = tw.div`
  divide-y
  divide-gray-200
`;

const LoadingContainer = tw.div`
  flex
  items-center
  justify-center
  py-20
`;

const LoadingText = tw.p`
  text-gray-500
  text-sm
`;

const EmptyContainer = tw.div`
  flex
  items-center
  justify-center
  py-20
`;

const EmptyText = tw.p`
  text-gray-500
  text-sm
`;
