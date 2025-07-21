import { Link, useLocation } from '@tanstack/react-router';
import tw from 'tailwind-styled-components';

interface EditorLeftMenuProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

const menuItems = [
  {
    name: '대시보드',
    path: '/editor',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    name: '포스트 관리',
    path: '/editor/posts',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    name: '통계',
    path: '/editor/analytics',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    name: '수익 관리',
    path: '/editor/revenue',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    name: '설정',
    path: '/editor/settings',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v6m0 6v6m4.22-10.22l4.24 4.24m-4.24 4.24l4.24 4.24M20 12h-6m-6 0H2m10.22-4.22L6.98 2.54m4.24 4.24L6.98 21.46" />
      </svg>
    ),
  },
];

export default function EditorLeftMenu({
  isSidebarOpen,
  setIsSidebarOpen,
}: EditorLeftMenuProps) {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <MobileMenuButton onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </MobileMenuButton>

      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <SidebarOverlay onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <Sidebar $isOpen={isSidebarOpen}>
        <SidebarHeader>
          <SidebarTitle>에디터</SidebarTitle>
          <CloseButton onClick={() => setIsSidebarOpen(false)}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </CloseButton>
        </SidebarHeader>

        <Nav>
          {menuItems.map((item) => (
            <NavItem
              key={item.path}
              to={item.path}
              $isActive={isActive(item.path)}
              onClick={() => setIsSidebarOpen(false)}
            >
              {item.icon}
              <span>{item.name}</span>
            </NavItem>
          ))}
        </Nav>

        <SidebarFooter>
          <BackToMainLink to="/">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span>메인으로</span>
          </BackToMainLink>
        </SidebarFooter>
      </Sidebar>
    </>
  );
}

// Styled Components
const MobileMenuButton = tw.button`
  fixed
  top-16
  left-4
  z-40
  p-2
  bg-white
  rounded-lg
  shadow-md
  lg:hidden
`;

const SidebarOverlay = tw.div`
  fixed
  inset-0
  bg-black/50
  z-30
  lg:hidden
`;

const Sidebar = tw.aside<{ $isOpen: boolean }>`
  fixed
  left-0
  top-14
  bottom-0
  w-64
  bg-white
  border-r
  border-gray-200
  transform
  transition-transform
  z-40
  flex
  flex-col
  ${(p) => (p.$isOpen ? 'translate-x-0' : '-translate-x-full')}
  lg:translate-x-0
  lg:sticky
  lg:h-[calc(100vh-3.5rem)]
`;

const SidebarHeader = tw.div`
  flex
  items-center
  justify-between
  p-6
  border-b
  border-gray-200
`;

const SidebarTitle = tw.h2`
  text-xl
  font-bold
  text-gray-900
`;

const CloseButton = tw.button`
  p-1
  rounded-lg
  hover:bg-gray-100
  lg:hidden
`;

const Nav = tw.nav`
  flex-1
  p-4
  space-y-1
  overflow-y-auto
`;

const NavItem = tw(Link)<{ $isActive: boolean }>`
  flex
  items-center
  gap-3
  px-4
  py-3
  rounded-lg
  text-sm
  font-medium
  transition-colors
  no-underline
  ${(p) =>
    p.$isActive
      ? 'bg-blue-50 text-blue-700'
      : 'text-gray-700 hover:bg-gray-100'}
`;

const SidebarFooter = tw.div`
  p-4
  border-t
  border-gray-200
`;

const BackToMainLink = tw(Link)`
  flex
  items-center
  gap-3
  px-4
  py-3
  rounded-lg
  text-sm
  font-medium
  text-gray-600
  hover:bg-gray-100
  transition-colors
  no-underline
`;
