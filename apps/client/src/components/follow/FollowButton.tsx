import { useState } from 'react';
import tw from 'tailwind-styled-components';

import { useAuthStore } from '../../stores/auth';

import { trpc } from '@/shared';

interface FollowButtonProps {
  followeeId: string;
}

const FollowButton = ({ followeeId }: FollowButtonProps) => {
  const user = useAuthStore((state) => state.user);
  const [isHovered, setIsHovered] = useState(false);

  const utils = trpc.useUtils();

  const { data: isFollowing } = trpc.follow.isFollowing.useQuery(
    { followeeId },
    { enabled: !!user },
  );

  const followMutation = trpc.follow.follow.useMutation({
    onMutate: async () => {
      await utils.follow.isFollowing.cancel({ followeeId });
      const previous = utils.follow.isFollowing.getData({ followeeId });
      utils.follow.isFollowing.setData({ followeeId }, true);
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) {
        utils.follow.isFollowing.setData({ followeeId }, context.previous);
      }
    },
    onSettled: () => {
      utils.follow.isFollowing.invalidate({ followeeId });
    },
  });

  const unfollowMutation = trpc.follow.unfollow.useMutation({
    onMutate: async () => {
      await utils.follow.isFollowing.cancel({ followeeId });
      const previous = utils.follow.isFollowing.getData({ followeeId });
      utils.follow.isFollowing.setData({ followeeId }, false);
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) {
        utils.follow.isFollowing.setData({ followeeId }, context.previous);
      }
    },
    onSettled: () => {
      utils.follow.isFollowing.invalidate({ followeeId });
    },
  });

  // 비로그인 또는 자기 자신이면 숨김
  if (!user || user.id === followeeId) {
    return null;
  }

  const handleClick = () => {
    if (isFollowing) {
      unfollowMutation.mutate({ followeeId });
    } else {
      followMutation.mutate({ followeeId });
    }
  };

  const isLoading = followMutation.isPending || unfollowMutation.isPending;

  if (isFollowing) {
    return (
      <FollowingButton
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        disabled={isLoading}
        $isHovered={isHovered}
      >
        {isHovered ? '언팔로우' : '팔로잉'}
      </FollowingButton>
    );
  }

  return (
    <FollowBtn onClick={handleClick} disabled={isLoading}>
      팔로우
    </FollowBtn>
  );
};

export default FollowButton;

// Styled Components
const FollowBtn = tw.button`
  px-4
  py-1.5
  text-sm
  font-semibold
  text-white
  bg-blue-500
  rounded-full
  hover:bg-blue-600
  transition-colors
  disabled:opacity-50
`;

const FollowingButton = tw.button<{ $isHovered: boolean }>`
  px-4
  py-1.5
  text-sm
  font-semibold
  rounded-full
  border
  transition-colors
  disabled:opacity-50
  ${({ $isHovered }) =>
    $isHovered
      ? 'text-red-500 border-red-300 bg-red-50 hover:bg-red-100'
      : 'text-gray-700 border-gray-300 bg-white hover:bg-gray-50'}
`;
