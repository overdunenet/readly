import tw from 'tailwind-styled-components';

import FollowButton from '../follow/FollowButton';

interface PostDetailProps {
  post: {
    id: string;
    title: string;
    content: string;
    excerpt?: string | null;
    thumbnail?: string | null;
    accessLevel: 'public' | 'subscriber' | 'purchaser' | 'private';
    status: 'draft' | 'published' | 'scheduled';
    price: number;
    publishedAt?: string | Date | null;
    createdAt: string | Date;
    author: {
      id: string;
      nickname: string;
      profileImage?: string | null;
    };
  };
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

const ACCESS_LEVEL_LABEL: Record<string, string> = {
  subscriber: '구독자 전용',
  purchaser: '구매자 전용',
  private: '비공개',
};

const PostDetail = ({ post }: PostDetailProps) => {
  const accessLabel = ACCESS_LEVEL_LABEL[post.accessLevel];

  return (
    <Container>
      <AuthorSection>
        <Avatar>
          {post.author.profileImage && (
            <img
              src={post.author.profileImage}
              alt={post.author.nickname}
              className="w-full h-full rounded-full object-cover"
            />
          )}
        </Avatar>
        <AuthorInfo>
          <AuthorName>{post.author.nickname}</AuthorName>
          <PublishTime>{formatRelativeTime(post.publishedAt)}</PublishTime>
        </AuthorInfo>
        <FollowButton followeeId={post.author.id} />
      </AuthorSection>

      <Title>{post.title}</Title>

      {accessLabel && <AccessBadge>{accessLabel}</AccessBadge>}

      {post.thumbnail && (
        <ThumbnailContainer>
          <Thumbnail src={post.thumbnail} alt={post.title} />
        </ThumbnailContainer>
      )}

      <ContentBody dangerouslySetInnerHTML={{ __html: post.content }} />

      <Divider />

      <BottomAuthorSection>
        <AuthorName>{post.author.nickname}</AuthorName>
        <FollowButton followeeId={post.author.id} />
      </BottomAuthorSection>
    </Container>
  );
};

export default PostDetail;

// Styled Components
const Container = tw.div`
  px-4
  py-6
  max-w-3xl
  mx-auto
`;

const AuthorSection = tw.div`
  flex
  items-center
  gap-3
  mb-6
`;

const Avatar = tw.div`
  w-10
  h-10
  rounded-full
  bg-gray-300
  flex-shrink-0
`;

const AuthorInfo = tw.div`
  flex-1
`;

const AuthorName = tw.h3`
  font-semibold
  text-sm
  text-gray-900
`;

const PublishTime = tw.time`
  text-xs
  text-gray-500
`;

const Title = tw.h1`
  text-2xl
  font-bold
  text-gray-900
  mb-4
`;

const AccessBadge = tw.span`
  inline-block
  px-2
  py-1
  text-xs
  font-medium
  text-gray-500
  bg-gray-100
  rounded
  mb-4
`;

const ThumbnailContainer = tw.div`
  relative
  aspect-video
  mb-6
  rounded-lg
  overflow-hidden
  bg-gray-100
`;

const Thumbnail = tw.img`
  w-full
  h-full
  object-cover
`;

const ContentBody = tw.div`
  prose
  prose-gray
  max-w-none
  mb-8
`;

const Divider = tw.hr`
  border-gray-200
  mb-6
`;

const BottomAuthorSection = tw.div`
  flex
  items-center
  justify-between
`;
