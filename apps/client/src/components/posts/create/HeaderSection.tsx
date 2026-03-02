import { useNavigate } from '@tanstack/react-router';
import tw from 'tailwind-styled-components';

interface HeaderSectionProps {
  title?: string;
  isValid: boolean;
  isDrafting: boolean;
  isPublishing: boolean;
  onSaveDraft: () => void;
  onPublish: () => void;
}

export function HeaderSection({
  title = '새 포스트 작성',
  isValid,
  isDrafting,
  isPublishing,
  onSaveDraft,
  onPublish,
}: HeaderSectionProps) {
  const navigate = useNavigate();

  return (
    <Header>
      <HeaderLeft>
        <BackButton
          onClick={() => navigate({ to: '/editor/posts' })}
          type="button"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          뒤로
        </BackButton>
        <Title>{title}</Title>
      </HeaderLeft>

      <HeaderRight>
        <SaveButton
          onClick={onSaveDraft}
          disabled={!isValid || isDrafting || isPublishing}
          type="button"
        >
          {isDrafting ? '저장 중...' : '임시저장'}
        </SaveButton>
        <PublishButton
          onClick={onPublish}
          disabled={!isValid || isDrafting || isPublishing}
          type="button"
        >
          {isPublishing ? '발행 중...' : '발행'}
        </PublishButton>
      </HeaderRight>
    </Header>
  );
}

// Styled Components
const Header = tw.div`
  flex
  items-center
  justify-between
  mb-8
  pb-4
  border-b
  border-gray-200
`;

const HeaderLeft = tw.div`
  flex
  items-center
  gap-4
`;

const HeaderRight = tw.div`
  flex
  items-center
  gap-3
`;

const BackButton = tw.button`
  flex
  items-center
  gap-2
  px-3
  py-2
  text-gray-600
  hover:text-gray-900
  hover:bg-gray-100
  rounded-lg
  transition-colors
`;

const Title = tw.h1`
  text-2xl
  lg:text-3xl
  font-bold
  text-gray-900
`;

const SaveButton = tw.button`
  px-4
  py-2
  text-gray-700
  border
  border-gray-300
  rounded-lg
  hover:bg-gray-50
  disabled:opacity-50
  disabled:cursor-not-allowed
  transition-colors
`;

const PublishButton = tw.button`
  px-6
  py-2
  bg-blue-600
  text-white
  font-medium
  rounded-lg
  hover:bg-blue-700
  disabled:opacity-50
  disabled:cursor-not-allowed
  transition-colors
`;
