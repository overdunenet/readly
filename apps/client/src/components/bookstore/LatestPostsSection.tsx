import { FileText } from 'lucide-react';
import tw from 'tailwind-styled-components';

interface PostItem {
  id: string;
  title: string;
  excerpt?: string | null;
  thumbnail?: string | null;
  publishedAt?: Date | string | null;
}

interface LatestPostsSectionProps {
  posts: PostItem[];
  total: number;
  isLoading: boolean;
}

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = new Date(date);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

const LatestPostsSection = ({
  posts,
  total,
  isLoading,
}: LatestPostsSectionProps) => (
  <Container>
    <Header>
      <Title>작품 목록</Title>
      <Count>{total}편</Count>
    </Header>

    {isLoading && (
      <LoadingContainer>
        <LoadingText>로딩 중...</LoadingText>
      </LoadingContainer>
    )}

    {!isLoading && posts.length === 0 && (
      <EmptyContainer>
        <EmptyIcon>
          <FileText size={40} />
        </EmptyIcon>
        <EmptyText>아직 발행된 작품이 없습니다</EmptyText>
      </EmptyContainer>
    )}

    {!isLoading && posts.length > 0 && (
      <PostList>
        {posts.map((post) => (
          <PostCard key={post.id}>
            {post.thumbnail ? (
              <Thumbnail src={post.thumbnail} alt={post.title} />
            ) : (
              <ThumbnailPlaceholder>
                <FileText size={24} />
              </ThumbnailPlaceholder>
            )}
            <PostInfo>
              <PostTitle>{post.title}</PostTitle>
              {post.excerpt && <PostExcerpt>{post.excerpt}</PostExcerpt>}
              <PostDate>{formatDate(post.publishedAt)}</PostDate>
            </PostInfo>
          </PostCard>
        ))}
      </PostList>
    )}
  </Container>
);

export default LatestPostsSection;

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

const Title = tw.h2`
  text-lg
  font-bold
  text-gray-900
`;

const Count = tw.span`
  text-sm
  text-gray-500
`;

const PostList = tw.div`
  divide-y
  divide-gray-100
`;

const PostCard = tw.article`
  flex
  items-center
  gap-4
  px-6
  py-4
`;

const Thumbnail = tw.img`
  w-16
  h-16
  rounded
  object-cover
  flex-shrink-0
`;

const ThumbnailPlaceholder = tw.div`
  w-16
  h-16
  rounded
  bg-gray-100
  flex
  items-center
  justify-center
  text-gray-400
  flex-shrink-0
`;

const PostInfo = tw.div`
  flex-1
  min-w-0
`;

const PostTitle = tw.h3`
  font-semibold
  text-gray-900
  truncate
`;

const PostExcerpt = tw.p`
  text-sm
  text-gray-500
  line-clamp-1
  mt-0.5
`;

const PostDate = tw.time`
  text-xs
  text-gray-400
  mt-1
  block
`;

const LoadingContainer = tw.div`
  flex
  items-center
  justify-center
  py-12
`;

const LoadingText = tw.p`
  text-sm
  text-gray-500
`;

const EmptyContainer = tw.div`
  flex
  flex-col
  items-center
  justify-center
  py-12
`;

const EmptyIcon = tw.div`
  text-gray-300
  mb-3
`;

const EmptyText = tw.p`
  text-sm
  text-gray-500
`;
