import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import tw from 'tailwind-styled-components';

import { useAuthStore } from '../../stores/auth';

import { useFollow } from './useFollow';

interface FollowButtonProps {
  followeeId: string;
}

const FollowButton = ({ followeeId }: FollowButtonProps) => {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const { isFollowing, isLoading, toggleFollow } = useFollow(
    followeeId,
    !!user,
  );

  // 자기 자신에게는 팔로우 버튼 미표시
  if (user?.id === followeeId) {
    return null;
  }

  // 비로그인 시 팔로우 버튼 표시 → 클릭 시 로그인 페이지로 이동
  if (!user) {
    const handleLoginRedirect = () => {
      navigate({
        to: '/login',
        search: { redirect: window.location.pathname },
      });
    };

    return <FollowBtn onClick={handleLoginRedirect}>팔로우</FollowBtn>;
  }

  if (isFollowing) {
    return (
      <FollowingButton
        onClick={toggleFollow}
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
    <FollowBtn onClick={toggleFollow} disabled={isLoading}>
      팔로우
    </FollowBtn>
  );
};

export default FollowButton;

// Styled Components
const FollowBtn = tw.button`
  w-20
  py-1.5
  text-sm
  font-semibold
  text-white
  text-center
  bg-blue-500
  rounded-full
  hover:bg-blue-600
  transition-colors
  disabled:opacity-50
`;

const FollowingButton = tw.button<{ $isHovered: boolean }>`
  w-20
  py-1.5
  text-sm
  font-semibold
  text-center
  rounded-full
  border
  transition-colors
  disabled:opacity-50
  ${({ $isHovered }) =>
    $isHovered
      ? 'text-red-500 border-red-300 bg-red-50 hover:bg-red-100'
      : 'text-gray-700 border-gray-300 bg-white hover:bg-gray-50'}
`;
