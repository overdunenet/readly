import tw from 'tailwind-styled-components';

interface FeedCardProps {
  author: string;
  authorAvatar?: string;
  title: string;
  excerpt: string;
  thumbnail?: string;
  publishedAt: string;
  likes: number;
  comments: number;
  tags?: string[];
}

const FeedCard = ({
  author,
  authorAvatar,
  title,
  excerpt,
  thumbnail,
  publishedAt,
  likes,
  comments,
  tags,
}: FeedCardProps) => {
  return (
    <CardContainer>
      <CardHeader>
        <Avatar>
          {authorAvatar && (
            <img
              src={authorAvatar}
              alt={author}
              className="w-full h-full rounded-full object-cover"
            />
          )}
        </Avatar>
        <AuthorInfo>
          <AuthorName>{author}</AuthorName>
          <PublishTime>{publishedAt}</PublishTime>
        </AuthorInfo>
      </CardHeader>

      <CardContent>
        <Title>{title}</Title>
        <Excerpt>{excerpt}</Excerpt>

        {thumbnail && (
          <ThumbnailContainer>
            <Thumbnail src={thumbnail} alt={title} />
          </ThumbnailContainer>
        )}

        {tags && tags.length > 0 && (
          <div>
            {tags.map((tag, index) => (
              <Tag key={index}>{tag}</Tag>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter>
        <ActionButton>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <span>{likes}</span>
        </ActionButton>

        <ActionButton>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
          <span>{comments}</span>
        </ActionButton>

        <ActionButton>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
        </ActionButton>

        <ActionButton>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="17 1 21 5 17 9" />
            <path d="M3 11V9a4 4 0 0 1 4-4h14" />
            <polyline points="7 23 3 19 7 15" />
            <path d="M21 13v2a4 4 0 0 1-4 4H3" />
          </svg>
        </ActionButton>
      </CardFooter>
    </CardContainer>
  );
};

export default FeedCard;

// Styled Components
const CardContainer = tw.article`
  border-b
  border-gray-200
  bg-white
`;

const CardHeader = tw.div`
  px-4
  py-3
  flex
  items-center
  gap-3
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

const CardContent = tw.div`
  px-4
  pb-3
`;

const Title = tw.h2`
  text-lg
  font-bold
  text-gray-900
  mb-2
  line-clamp-2
`;

const Excerpt = tw.p`
  text-sm
  text-gray-700
  line-clamp-3
  mb-3
`;

const ThumbnailContainer = tw.div`
  relative
  aspect-video
  mb-3
  rounded-lg
  overflow-hidden
  bg-gray-100
`;

const Thumbnail = tw.img`
  w-full
  h-full
  object-cover
`;

const CardFooter = tw.div`
  px-4
  py-3
  flex
  items-center
  justify-between
  border-t
  border-gray-100
`;

const ActionButton = tw.button`
  flex
  items-center
  gap-2
  text-sm
  text-gray-600
  hover:text-gray-900
  transition-colors
`;

const Tag = tw.span`
  inline-block
  px-2
  py-1
  text-xs
  font-medium
  bg-gray-100
  text-gray-700
  rounded
  mr-2
  mb-2
`;
