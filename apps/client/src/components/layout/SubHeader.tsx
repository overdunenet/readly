import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import tw from 'tailwind-styled-components';

import { useAuth } from '../../hooks/useAuth';

import UserMenu from './UserMenu';

interface SubHeaderProps {
  title: string;
  onBack?: () => void;
}

const SubHeader = ({ title, onBack }: SubHeaderProps) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate({ to: '/' });
    }
  };

  const handleLogout = async () => {
    setShowUserMenu(false);
    await logout();
  };

  return (
    <HeaderContainer>
      <LeftSection>
        <BackButton onClick={handleBack}>
          <ArrowLeft size={20} />
        </BackButton>
        <Title>{title}</Title>
      </LeftSection>

      <RightSection>
        {isAuthenticated ? (
          <UserMenu
            user={user}
            isOpen={showUserMenu}
            onToggle={() => setShowUserMenu(!showUserMenu)}
            onClose={() => setShowUserMenu(false)}
            onLogout={handleLogout}
          />
        ) : null}
      </RightSection>
    </HeaderContainer>
  );
};

export default SubHeader;

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

const LeftSection = tw.div`
  flex
  items-center
  gap-3
`;

const BackButton = tw.button`
  p-2
  -ml-2
  rounded-full
  hover:bg-gray-100
  transition-colors
  text-gray-700
`;

const Title = tw.h1`
  text-lg
  font-semibold
  text-gray-900
`;

const RightSection = tw.div`
  flex
  items-center
`;
