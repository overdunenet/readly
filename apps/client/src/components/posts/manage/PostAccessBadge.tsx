import { Lock } from 'lucide-react';
import tw from 'tailwind-styled-components';

import { PostAccessLevel } from '@/components/posts/manage/types';

interface PostAccessBadgeProps {
  accessLevel: PostAccessLevel;
}

const ACCESS_CONFIG: Record<
  PostAccessLevel,
  { label: string; className: string }
> = {
  public: { label: '전체공개', className: 'border-green-300 text-green-700' },
  subscriber: {
    label: '구독자 전용',
    className: 'border-blue-300 text-blue-700',
  },
  purchaser: {
    label: '구매자 전용',
    className: 'border-purple-300 text-purple-700',
  },
  private: { label: '비공개', className: 'border-gray-300 text-gray-700' },
};

const PostAccessBadge = ({ accessLevel }: PostAccessBadgeProps) => {
  const config = ACCESS_CONFIG[accessLevel];

  return (
    <Badge className={config.className}>
      {accessLevel === 'private' && <Lock size={12} />}
      {config.label}
    </Badge>
  );
};

export default PostAccessBadge;

// Styled Components
const Badge = tw.span`
  inline-flex
  items-center
  gap-1
  px-2
  py-0.5
  text-xs
  font-medium
  rounded-full
  border
  bg-white
`;
