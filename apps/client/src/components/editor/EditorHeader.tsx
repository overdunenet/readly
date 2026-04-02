import { Link } from '@tanstack/react-router';
import { Bell, Search } from 'lucide-react';
import { useState } from 'react';
import tw from 'tailwind-styled-components';

import { useAuth } from '../../hooks/useAuth';
import UserMenu from '../layout/UserMenu';

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
            <Search size={24} />
          </NavButton>

          <NavButton>
            <Bell size={24} />
          </NavButton>

          {isAuthenticated && (
            <UserMenu
              user={user}
              isOpen={showUserMenu}
              onToggle={() => setShowUserMenu(!showUserMenu)}
              onClose={() => setShowUserMenu(false)}
              onLogout={handleLogout}
            />
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
