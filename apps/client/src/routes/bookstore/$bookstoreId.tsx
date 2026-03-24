import { createFileRoute } from '@tanstack/react-router';
import tw from 'tailwind-styled-components';

import Layout from '../../components/layout/Layout';

import BookstoreProfile from '@/components/bookstore/BookstoreProfile';
import LatestPostsSection from '@/components/bookstore/LatestPostsSection';
import { trpc } from '@/shared';

export const Route = createFileRoute('/bookstore/$bookstoreId')({
  component: BookstoreDetailPage,
});

function BookstoreDetailPage() {
  const { bookstoreId } = Route.useParams();

  const bookstoreQuery = trpc.bookstore.getById.useQuery({ bookstoreId });
  const postsQuery = trpc.bookstore.getPosts.useQuery({
    bookstoreId,
    page: 1,
    limit: 20,
  });

  if (bookstoreQuery.isLoading) {
    return (
      <Layout>
        <LoadingContainer>
          <LoadingText>로딩 중...</LoadingText>
        </LoadingContainer>
      </Layout>
    );
  }

  if (bookstoreQuery.error || !bookstoreQuery.data) {
    return (
      <Layout>
        <ErrorContainer>
          <ErrorText>서점을 찾을 수 없습니다.</ErrorText>
        </ErrorContainer>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageContainer>
        <BookstoreProfile bookstore={bookstoreQuery.data} />
        <LatestPostsSection
          posts={postsQuery.data?.posts ?? []}
          total={postsQuery.data?.total ?? 0}
          isLoading={postsQuery.isLoading}
        />
      </PageContainer>
    </Layout>
  );
}

// Styled Components
const PageContainer = tw.div`
  px-4
  py-6
  space-y-6
`;

const LoadingContainer = tw.div`
  flex
  items-center
  justify-center
  py-20
`;

const LoadingText = tw.p`
  text-sm
  text-gray-500
`;

const ErrorContainer = tw.div`
  flex
  items-center
  justify-center
  py-20
`;

const ErrorText = tw.p`
  text-sm
  text-gray-500
`;
