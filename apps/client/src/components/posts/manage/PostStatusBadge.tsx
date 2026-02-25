import tw from 'tailwind-styled-components';

import { PostStatus } from '@/components/posts/manage/types';

interface PostStatusBadgeProps {
  status: PostStatus;
}

const STATUS_CONFIG: Record<PostStatus, { label: string; className: string }> =
  {
    draft: { label: '임시저장', className: 'bg-gray-100 text-gray-700' },
    published: { label: '발행됨', className: 'bg-green-100 text-green-700' },
    scheduled: { label: '예약됨', className: 'bg-blue-100 text-blue-700' },
  };

const PostStatusBadge = ({ status }: PostStatusBadgeProps) => {
  const config = STATUS_CONFIG[status];

  return <Badge className={config.className}>{config.label}</Badge>;
};

export default PostStatusBadge;

// Styled Components
const Badge = tw.span`
  inline-flex
  items-center
  px-2
  py-0.5
  text-xs
  font-medium
  rounded-full
`;
