import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import tw from 'tailwind-styled-components';

import { useAuth } from '../../hooks/useAuth';

export default function EditorHeader() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    setShowUserMenu(false);
    await logout();
  };

  return (
    <Header>
      <HeaderContent>
        <Logo to="/">Readly</Logo>

        <NavContainer>
          <NavButton>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </NavButton>

          <NavButton>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </NavButton>

          {isAuthenticated && (
            <UserMenuContainer>
              <UserButton onClick={() => setShowUserMenu(!showUserMenu)}>
                <UserAvatar>
                  {user?.nickname?.charAt(0).toUpperCase() || 'U'}
                </UserAvatar>
              </UserButton>

              {showUserMenu && (
                <>
                  <MenuOverlay onClick={() => setShowUserMenu(false)} />
                  <UserMenu>
                    <UserInfo>
                      <UserName>{user?.nickname}</UserName>
                      <UserEmail>{user?.email}</UserEmail>
                    </UserInfo>
                    <MenuDivider />
                    <MenuItem onClick={handleLogout}>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      로그아웃
                    </MenuItem>
                  </UserMenu>
                </>
              )}
            </UserMenuContainer>
          )}
        </NavContainer>
      </HeaderContent>
    </Header>
  );
}

// Styled Components
const Header = tw.header`
  fixed
  top-0
  left-0
  right-0
  h-14
  bg-white
  border-b
  border-gray-200
  z-50
`;

const HeaderContent = tw.div`
  h-full
  px-4
  lg:px-6
  flex
  items-center
  justify-between
`;

const Logo = tw(Link)`
  text-xl
  font-bold
  text-gray-900
  no-underline
  hover:text-gray-700
  transition-colors
`;

const NavContainer = tw.nav`
  flex
  items-center
  gap-4
`;

const NavButton = tw.button`
  p-2
  rounded-full
  hover:bg-gray-100
  transition-colors
`;

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

const UserMenu = tw.div`
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
