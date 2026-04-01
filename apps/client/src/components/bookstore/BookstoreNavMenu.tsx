import { Link } from '@tanstack/react-router';
import { User, BookOpen, Settings } from 'lucide-react';
import tw from 'tailwind-styled-components';

interface BookstoreNavMenuProps {
  bookstoreId: string;
}

const MENU_ITEMS = [
  {
    label: '프로필 편집',
    to: '/my-bookstore/profile',
    icon: User,
    badge: null,
  },
  {
    label: '작품 관리',
    to: '/my-bookstore/works',
    icon: BookOpen,
    badge: null,
  },
  {
    label: '발행 설정',
    to: '/my-bookstore/publish-settings',
    icon: Settings,
    badge: 'Growth',
  },
] as const;

const BookstoreNavMenu = ({
  bookstoreId: _bookstoreId,
}: BookstoreNavMenuProps) => (
  <Container>
    <MenuList>
      {MENU_ITEMS.map((item) => (
        <MenuItem key={item.to}>
          <MenuLink to={item.to}>
            <MenuLeft>
              <item.icon size={16} />
              <MenuLabel>{item.label}</MenuLabel>
            </MenuLeft>
            {item.badge && <Badge>{item.badge}</Badge>}
          </MenuLink>
        </MenuItem>
      ))}
    </MenuList>
  </Container>
);

export default BookstoreNavMenu;

// Styled Components
const Container = tw.div`
  bg-white
  rounded-lg
  shadow
`;

const MenuList = tw.ul`
  divide-y
  divide-gray-100
`;

const MenuItem = tw.li``;

const MenuLink = tw(Link)`
  flex
  items-center
  justify-between
  px-6
  py-4
  hover:bg-gray-50
  transition-colors
  no-underline
`;

const MenuLeft = tw.div`
  flex
  items-center
  gap-3
  text-gray-700
`;

const MenuLabel = tw.span`
  text-sm
  font-medium
`;

const Badge = tw.span`
  px-2
  py-0.5
  text-xs
  font-semibold
  bg-green-100
  text-green-700
  rounded-full
`;
