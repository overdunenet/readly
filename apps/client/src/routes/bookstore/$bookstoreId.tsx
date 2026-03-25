import { createFileRoute } from '@tanstack/react-router';
import { Suspense } from 'react';
import tw from 'tailwind-styled-components';

import Layout from '../../components/layout/Layout';

import BookstoreProfile from '@/components/bookstore/BookstoreProfile';
import LatestPostsSection from '@/components/bookstore/LatestPostsSection';
import PopularPostsSection from '@/components/bookstore/PopularPostsSection';
import FollowButton from '@/components/follow/FollowButton';
import { trpc } from '@/shared';

export const Route = createFileRoute('/bookstore/$bookstoreId')({
  component: BookstoreDetailPage,
});

function BookstoreDetailPage() {
  const { bookstoreId } = Route.useParams();

  const [bookstore] = trpc.bookstore.getById.useSuspenseQuery({ bookstoreId });
  const [postsData] = trpc.bookstore.getPosts.useSuspenseQuery({
    bookstoreId,
    page: 1,
    limit: 20,
  });

  return (
    <Layout>
      <PageContainer>
        <BookstoreProfile bookstore={bookstore} />
        <FollowButton followeeId={bookstore.userId} />
        <Suspense fallback={<SectionLoading />}>
          <PopularPostsSection bookstoreId={bookstoreId} />
        </Suspense>
        <LatestPostsSection
          posts={postsData.posts ?? []}
          total={postsData.total ?? 0}
        />
      </PageContainer>
    </Layout>
  );
}

const SectionLoading = () => (
  <LoadingContainer>
    <LoadingText>로딩 중...</LoadingText>
  </LoadingContainer>
);

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
  py-8
`;

const LoadingText = tw.p`
  text-sm
  text-gray-500
`;
