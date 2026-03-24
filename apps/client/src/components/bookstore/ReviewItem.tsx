import { Pencil, Trash2 } from 'lucide-react';
import tw from 'tailwind-styled-components';

interface ReviewItemProps {
  review: {
    id: string;
    content: string;
    reviewerId: string;
    reviewer?: {
      id: string;
      nickname: string;
      profileImage?: string | null;
    };
    createdAt: Date | string;
  };
  currentUserId?: string;
  onEdit?: (reviewId: string) => void;
  onDelete?: (reviewId: string) => void;
}

function formatDate(date: Date | string): string {
  const d = new Date(date);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

const ReviewItem = ({
  review,
  currentUserId,
  onEdit,
  onDelete,
}: ReviewItemProps) => {
  const isOwner = currentUserId === review.reviewerId;

  return (
    <Container>
      <Header>
        <AuthorInfo>
          {review.reviewer?.profileImage ? (
            <Avatar
              src={review.reviewer.profileImage}
              alt={review.reviewer.nickname}
            />
          ) : (
            <DefaultAvatar>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </DefaultAvatar>
          )}
          <AuthorName>{review.reviewer?.nickname ?? '알 수 없음'}</AuthorName>
          <ReviewDate>{formatDate(review.createdAt)}</ReviewDate>
        </AuthorInfo>
        {isOwner && (
          <Actions>
            {onEdit && (
              <ActionButton onClick={() => onEdit(review.id)}>
                <Pencil size={14} />
              </ActionButton>
            )}
            {onDelete && (
              <ActionButton onClick={() => onDelete(review.id)}>
                <Trash2 size={14} />
              </ActionButton>
            )}
          </Actions>
        )}
      </Header>
      <Content>{review.content}</Content>
    </Container>
  );
};

export default ReviewItem;

// Styled Components
const Container = tw.div`
  px-6
  py-4
`;

const Header = tw.div`
  flex
  items-center
  justify-between
  mb-2
`;

const AuthorInfo = tw.div`
  flex
  items-center
  gap-2
`;

const Avatar = tw.img`
  w-6
  h-6
  rounded-full
  object-cover
`;

const DefaultAvatar = tw.div`
  w-6
  h-6
  rounded-full
  bg-gray-100
  flex
  items-center
  justify-center
  text-gray-400
`;

const AuthorName = tw.span`
  text-sm
  font-medium
  text-gray-900
`;

const ReviewDate = tw.span`
  text-xs
  text-gray-400
`;

const Actions = tw.div`
  flex
  items-center
  gap-1
`;

const ActionButton = tw.button`
  p-1
  text-gray-400
  hover:text-gray-600
  transition-colors
`;

const Content = tw.p`
  text-sm
  text-gray-700
  leading-relaxed
`;
