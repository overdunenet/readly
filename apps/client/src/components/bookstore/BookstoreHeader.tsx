import type { AppRouter } from '@readly/api-types/src/server';
import type { inferRouterOutputs } from '@trpc/server';
import tw from 'tailwind-styled-components';

type RouterOutputs = inferRouterOutputs<AppRouter>;
type Bookstore = RouterOutputs['bookstore']['getMyBookstore'];

interface BookstoreHeaderProps {
  bookstore: Bookstore;
}

const BookstoreHeader = ({ bookstore }: BookstoreHeaderProps) => (
  <Container>
    <ProfileSection>
      {bookstore.profileImage ? (
        <ProfileImage src={bookstore.profileImage} alt={bookstore.penName} />
      ) : (
        <DefaultAvatar>
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </DefaultAvatar>
      )}
      <Info>
        <PenName>{bookstore.penName}</PenName>
        <StoreName>{bookstore.storeName}</StoreName>
      </Info>
    </ProfileSection>
  </Container>
);

export default BookstoreHeader;

// Styled Components
const Container = tw.div`
  bg-white
  rounded-lg
  shadow
  p-6
`;

const ProfileSection = tw.div`
  flex
  items-center
  gap-4
`;

const ProfileImage = tw.img`
  w-16
  h-16
  rounded-full
  object-cover
`;

const DefaultAvatar = tw.div`
  w-16
  h-16
  rounded-full
  bg-gray-100
  flex
  items-center
  justify-center
  text-gray-400
`;

const Info = tw.div`
  flex
  flex-col
`;

const PenName = tw.h2`
  text-lg
  font-bold
  text-gray-900
`;

const StoreName = tw.p`
  text-sm
  text-gray-500
`;
