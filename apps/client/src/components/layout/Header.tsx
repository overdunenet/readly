import { Link } from '@tanstack/react-router';
import { Bell, Search } from 'lucide-react';
import { useState } from 'react';
import tw from 'tailwind-styled-components';

import { useAuth } from '../../hooks/useAuth';

import UserMenu from './UserMenu';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    setShowUserMenu(false);
    await logout();
  };

  return (
    <HeaderContainer>
      <Logo to="/">Readly</Logo>

      <NavContainer>
        <NavButton>
          <Search size={24} />
        </NavButton>

        <NavButton>
          <Bell size={24} />
        </NavButton>

        {isAuthenticated ? (
          <UserMenu
            user={user}
            isOpen={showUserMenu}
            onToggle={() => setShowUserMenu(!showUserMenu)}
            onClose={() => setShowUserMenu(false)}
            onLogout={handleLogout}
          />
        ) : (
          <LoginButton to="/login">로그인</LoginButton>
        )}
      </NavContainer>
    </HeaderContainer>
  );
};

export default Header;

// Styled Components
const HeaderContainer = tw.header`
  fixed
  top-0
  left-0
  right-0
  h-14
  bg-white
  border-b
  border-gray-200
  z-50
  px-4
  flex
  items-center
  justify-between
  md:max-w-md
  md:mx-auto
  md:px-6
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

const LoginButton = tw(Link)`
  px-4
  py-1.5
  text-sm
  font-medium
  text-blue-600
  border
  border-blue-600
  rounded-full
  hover:bg-blue-50
  transition-colors
  no-underline
`;
