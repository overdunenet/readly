import type { AppRouter } from '@readly/api-types/src/server';
import type { inferRouterOutputs } from '@trpc/server';
import tw from 'tailwind-styled-components';

type RouterOutputs = inferRouterOutputs<AppRouter>;
type Bookstore = RouterOutputs['bookstore']['getById'];

interface BookstoreProfileProps {
  bookstore: Bookstore;
}

const BookstoreProfile = ({ bookstore }: BookstoreProfileProps) => (
  <Container>
    {bookstore.coverImage && (
      <CoverImage src={bookstore.coverImage} alt={bookstore.storeName} />
    )}
    <ProfileSection>
      {bookstore.profileImage ? (
        <ProfileImage src={bookstore.profileImage} alt={bookstore.penName} />
      ) : (
        <DefaultAvatar>
          <svg
            width="40"
            height="40"
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
    {bookstore.bio && <Bio>{bookstore.bio}</Bio>}
  </Container>
);

export default BookstoreProfile;

// Styled Components
const Container = tw.div`
  bg-white
  rounded-lg
  shadow
  overflow-hidden
`;

const CoverImage = tw.img`
  w-full
  h-32
  object-cover
`;

const ProfileSection = tw.div`
  flex
  items-center
  gap-4
  px-6
  pt-6
  pb-2
`;

const ProfileImage = tw.img`
  w-20
  h-20
  rounded-full
  object-cover
  border-2
  border-white
  shadow-sm
`;

const DefaultAvatar = tw.div`
  w-20
  h-20
  rounded-full
  bg-gray-100
  flex
  items-center
  justify-center
  text-gray-400
  border-2
  border-white
  shadow-sm
`;

const Info = tw.div`
  flex
  flex-col
`;

const PenName = tw.h1`
  text-xl
  font-bold
  text-gray-900
`;

const StoreName = tw.p`
  text-sm
  text-gray-500
`;

const Bio = tw.p`
  px-6
  pb-6
  pt-2
  text-sm
  text-gray-600
  leading-relaxed
`;
