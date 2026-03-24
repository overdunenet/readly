import { Link } from '@tanstack/react-router';
import { FileText, LogOut, Settings, SquarePen, Wallet } from 'lucide-react';
import tw from 'tailwind-styled-components';

import type { User } from '../../stores/auth';

interface Props {
  user: User | null;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onLogout: () => void;
}

const UserMenu = ({ user, isOpen, onToggle, onClose, onLogout }: Props) => (
  <UserMenuContainer>
    <UserButton onClick={onToggle}>
      <UserAvatar>{user?.nickname?.charAt(0).toUpperCase() || 'U'}</UserAvatar>
    </UserButton>

    {isOpen && (
      <>
        <MenuOverlay onClick={onClose} />
        <UserMenuDropdown>
          <UserInfo>
            <UserName>{user?.nickname}</UserName>
            <UserEmail>{user?.email}</UserEmail>
          </UserInfo>
          <MenuDivider />
          <MenuLinkItem to="/editor" onClick={onClose}>
            <SquarePen size={16} />
            글쓰기
          </MenuLinkItem>
          <MenuLinkItem to="/editor/posts" onClick={onClose}>
            <FileText size={16} />내 포스트
          </MenuLinkItem>
          <MenuLinkItem to="/my/cash" onClick={onClose}>
            <Wallet size={16} />
            캐시 관리
          </MenuLinkItem>
          <MenuDivider />
          <MenuLinkItem to="/editor/settings" onClick={onClose}>
            <Settings size={16} />
            설정
          </MenuLinkItem>
          <MenuItem onClick={onLogout}>
            <LogOut size={16} />
            로그아웃
          </MenuItem>
        </UserMenuDropdown>
      </>
    )}
  </UserMenuContainer>
);

export default UserMenu;

// Styled Components
const UserMenuContainer = tw.div`
  relative
`;

const UserButton = tw.button`
  flex
  items-center
  gap-2
  p-1
  rounded-full
  hover:bg-gray-100
  transition-colors
`;

const UserAvatar = tw.div`
  w-8
  h-8
  rounded-full
  bg-blue-600
  text-white
  flex
  items-center
  justify-center
  text-sm
  font-medium
`;

const MenuOverlay = tw.div`
  fixed
  inset-0
  z-40
`;

const UserMenuDropdown = tw.div`
  absolute
  right-0
  mt-2
  w-64
  bg-white
  rounded-lg
  shadow-lg
  border
  border-gray-200
  py-2
  z-50
`;

const UserInfo = tw.div`
  px-4
  py-2
`;

const UserName = tw.p`
  font-medium
  text-gray-900
`;

const UserEmail = tw.p`
  text-sm
  text-gray-500
`;

const MenuDivider = tw.div`
  my-2
  border-t
  border-gray-200
`;

const MenuLinkItem = tw(Link)`
  w-full
  px-4
  py-2
  text-left
  text-sm
  text-gray-700
  hover:bg-gray-100
  flex
  items-center
  gap-3
  transition-colors
  no-underline
`;

const MenuItem = tw.button`
  w-full
  px-4
  py-2
  text-left
  text-sm
  text-gray-700
  hover:bg-gray-100
  flex
  items-center
  gap-3
  transition-colors
  no-underline
`;
