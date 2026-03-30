import { FileText } from 'lucide-react';
import tw from 'tailwind-styled-components';

import PostAccessBadge from '@/components/posts/manage/PostAccessBadge';
import PostActions from '@/components/posts/manage/PostActions';
import PostStatusBadge from '@/components/posts/manage/PostStatusBadge';
import { PostItem } from '@/components/posts/manage/types';

interface PostListItemProps {
  post: PostItem;
  onEdit: (postId: string) => void;
  onPublish: (postId: string) => void;
  onUnpublish: (postId: string) => void;
  onDelete: (postId: string) => void;
}

function formatRelativeTime(date: string | Date | null | undefined): string {
  if (!date) return '';
  const now = new Date();
  const target = new Date(date);
  const diffMs = now.getTime() - target.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 30) return `${diffDay}일 전`;
  const diffMonth = Math.floor(diffDay / 30);
  if (diffMonth < 12) return `${diffMonth}개월 전`;
  return `${Math.floor(diffMonth / 12)}년 전`;
}

const PostListItem = ({
  post,
  onEdit,
  onPublish,
  onUnpublish,
  onDelete,
}: PostListItemProps) => {
  const displayDate =
    post.status === 'published' ? post.publishedAt : post.createdAt;
  const dateLabel = post.status === 'published' ? '발행' : '작성';

  return (
    <Card>
      <ThumbnailContainer>
        {post.thumbnail ? (
          <ThumbnailImage src={post.thumbnail} alt={post.title} />
        ) : (
          <ThumbnailPlaceholder>
            <FileText size={24} className="text-gray-400" />
          </ThumbnailPlaceholder>
        )}
      </ThumbnailContainer>

      <ContentArea>
        <Title>{post.title || '(제목 없음)'}</Title>
        <Excerpt>{post.excerpt || '내용 없음'}</Excerpt>

        <MetaRow>
          <BadgeGroup>
            <PostStatusBadge status={post.status} />
            <PostAccessBadge accessLevel={post.accessLevel} />
            <PriceText $highlight={post.price > 0}>
              {post.price === 0 ? '무료' : `₩${post.price.toLocaleString()}`}
            </PriceText>
          </BadgeGroup>
          <DateText>
            {dateLabel} {formatRelativeTime(displayDate)}
          </DateText>
        </MetaRow>
      </ContentArea>

      <ActionsContainer>
        <PostActions
          status={post.status}
          onEdit={() => onEdit(post.id)}
          onPublish={() => onPublish(post.id)}
          onUnpublish={() => onUnpublish(post.id)}
          onDelete={() => onDelete(post.id)}
        />
      </ActionsContainer>
    </Card>
  );
};

export default PostListItem;

// Styled Components
const Card = tw.article`
  bg-white
  rounded-lg
  shadow-sm
  border
  border-gray-200
  p-4
  flex
  items-center
  gap-4
`;

const ThumbnailContainer = tw.div`
  hidden
  sm:block
  flex-shrink-0
`;

const ThumbnailImage = tw.img`
  w-16
  h-16
  object-cover
  rounded
`;

const ThumbnailPlaceholder = tw.div`
  w-16
  h-16
  rounded
  bg-gray-100
  flex
  items-center
  justify-center
`;

const ContentArea = tw.div`
  flex-1
  min-w-0
`;

const Title = tw.h3`
  font-semibold
  text-gray-900
  truncate
`;

const Excerpt = tw.p`
  text-sm
  text-gray-500
  line-clamp-1
  mt-0.5
`;

const MetaRow = tw.div`
  flex
  items-center
  justify-between
  mt-2
  gap-2
`;

const BadgeGroup = tw.div`
  flex
  items-center
  gap-2
  flex-wrap
`;

const PriceText = tw.span<{ $highlight: boolean }>`
  text-xs
  font-medium
  ${({ $highlight }) => ($highlight ? 'text-blue-600' : 'text-gray-500')}
`;

const DateText = tw.time`
  text-xs
  text-gray-400
  flex-shrink-0
`;

const ActionsContainer = tw.div`
  flex-shrink-0
`;
