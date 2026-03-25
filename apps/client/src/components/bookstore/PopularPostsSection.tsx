import { TrendingUp, FileText } from 'lucide-react';
import tw from 'tailwind-styled-components';

import { trpc } from '@/shared';
import { formatDate } from '@/utils/date';

interface PopularPostsSectionProps {
  bookstoreId: string;
}

const PopularPostsSection = ({ bookstoreId }: PopularPostsSectionProps) => {
  const [posts] = trpc.bookstore.getPopularPosts.useSuspenseQuery({
    bookstoreId,
    limit: 5,
  });

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <TrendingUp size={16} />
          <Title>인기 글</Title>
        </HeaderLeft>
      </Header>

      {posts.length === 0 && (
        <EmptyContainer>
          <EmptyIcon>
            <FileText size={32} />
          </EmptyIcon>
          <EmptyText>아직 인기 글이 없습니다</EmptyText>
        </EmptyContainer>
      )}

      {posts.length > 0 && (
        <PostList>
          {posts.map((post, index) => (
            <PostItem key={post.id}>
              <Rank>{index + 1}</Rank>
              <PostInfo>
                <PostTitle>{post.title}</PostTitle>
                {post.publishedAt && (
                  <PostDate>{formatDate(post.publishedAt)}</PostDate>
                )}
              </PostInfo>
            </PostItem>
          ))}
        </PostList>
      )}
    </Container>
  );
};

export default PopularPostsSection;

// Styled Components
const Container = tw.div`
  bg-white
  rounded-lg
  shadow
`;

const Header = tw.div`
  flex
  items-center
  justify-between
  px-6
  py-4
  border-b
  border-gray-100
`;

const HeaderLeft = tw.div`
  flex
  items-center
  gap-2
  text-gray-900
`;

const Title = tw.h2`
  text-lg
  font-bold
`;

const PostList = tw.div`
  divide-y
  divide-gray-100
`;

const PostItem = tw.div`
  flex
  items-center
  gap-4
  px-6
  py-3
`;

const Rank = tw.span`
  flex-shrink-0
  w-6
  h-6
  flex
  items-center
  justify-center
  text-sm
  font-bold
  text-blue-600
`;

const PostInfo = tw.div`
  flex-1
  min-w-0
`;

const PostTitle = tw.h3`
  text-sm
  font-medium
  text-gray-900
  truncate
`;

const PostDate = tw.time`
  text-xs
  text-gray-400
  mt-0.5
  block
`;

const EmptyContainer = tw.div`
  flex
  flex-col
  items-center
  justify-center
  py-8
`;

const EmptyIcon = tw.div`
  text-gray-300
  mb-2
`;

const EmptyText = tw.p`
  text-sm
  text-gray-500
`;
