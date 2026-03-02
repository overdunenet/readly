import { createFileRoute } from '@tanstack/react-router';
import { Helmet } from 'react-helmet-async';
import tw from 'tailwind-styled-components';

import Layout from '../../components/layout/Layout';
import PostDetail from '../../components/post/PostDetail';

import { trpc } from '@/shared';

export const Route = createFileRoute('/posts/$postId')({
  component: PostDetailPage,
});

function PostDetailPage() {
  const { postId } = Route.useParams();
  const {
    data: post,
    isLoading,
    isError,
  } = trpc.post.getOne.useQuery({ postId });

  if (isLoading) {
    return (
      <Layout>
        <LoadingContainer>
          <LoadingText>로딩 중...</LoadingText>
        </LoadingContainer>
      </Layout>
    );
  }

  if (isError || !post) {
    return (
      <Layout>
        <ErrorContainer>
          <ErrorText>포스트를 찾을 수 없습니다.</ErrorText>
        </ErrorContainer>
      </Layout>
    );
  }

  return (
    <Layout>
      <Helmet>
        <title>{post.title}</title>
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt ?? post.title} />
        {post.thumbnail && (
          <meta property="og:image" content={post.thumbnail} />
        )}
      </Helmet>

      <PostDetail post={post} />
    </Layout>
  );
}

// Styled Components
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

const ErrorContainer = tw.div`
  flex
  items-center
  justify-center
  py-20
`;

const ErrorText = tw.p`
  text-gray-500
  text-sm
`;
