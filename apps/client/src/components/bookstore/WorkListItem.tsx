import { FileText, Edit2 } from 'lucide-react';
import tw from 'tailwind-styled-components';

interface WorkItem {
  id: string;
  title: string;
  excerpt?: string | null;
  thumbnail?: string | null;
  status: 'draft' | 'published' | 'scheduled';
  publishedAt?: Date | string | null;
  updatedAt: Date | string;
}

interface WorkListItemProps {
  work: WorkItem;
  onEdit: (postId: string) => void;
}

const STATUS_LABELS: Record<string, { label: string; style: string }> = {
  draft: { label: '임시저장', style: 'bg-gray-100 text-gray-600' },
  published: { label: '발행됨', style: 'bg-green-100 text-green-700' },
  scheduled: { label: '예약', style: 'bg-blue-100 text-blue-700' },
};

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

const WorkListItem = ({ work, onEdit }: WorkListItemProps) => {
  const statusInfo = STATUS_LABELS[work.status] ?? STATUS_LABELS.draft;

  return (
    <Card>
      <ThumbnailContainer>
        {work.thumbnail ? (
          <ThumbnailImage src={work.thumbnail} alt={work.title} />
        ) : (
          <ThumbnailPlaceholder>
            <FileText size={24} className="text-gray-400" />
          </ThumbnailPlaceholder>
        )}
      </ThumbnailContainer>

      <ContentArea>
        <TitleRow>
          <Title>{work.title}</Title>
          <StatusBadge className={statusInfo.style}>
            {statusInfo.label}
          </StatusBadge>
        </TitleRow>
        {work.excerpt && <Excerpt>{work.excerpt}</Excerpt>}
        <DateText>수정 {formatRelativeTime(work.updatedAt)}</DateText>
      </ContentArea>

      <EditButton onClick={() => onEdit(work.id)}>
        <Edit2 size={16} />
      </EditButton>
    </Card>
  );
};

export default WorkListItem;

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
  w-14
  h-14
  object-cover
  rounded
`;

const ThumbnailPlaceholder = tw.div`
  w-14
  h-14
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

const TitleRow = tw.div`
  flex
  items-center
  gap-2
`;

const Title = tw.h3`
  font-semibold
  text-gray-900
  truncate
`;

const StatusBadge = tw.span`
  px-2
  py-0.5
  text-xs
  font-medium
  rounded-full
  flex-shrink-0
`;

const Excerpt = tw.p`
  text-sm
  text-gray-500
  line-clamp-1
  mt-0.5
`;

const DateText = tw.time`
  text-xs
  text-gray-400
  mt-1
  block
`;

const EditButton = tw.button`
  p-2
  text-gray-400
  hover:text-gray-600
  hover:bg-gray-100
  rounded-lg
  transition-colors
  flex-shrink-0
`;
