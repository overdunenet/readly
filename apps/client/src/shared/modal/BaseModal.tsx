import { ReactNode } from 'react';
import SnappyModal from 'react-snappy-modal';
import tw from 'tailwind-styled-components';

interface BaseModalProps {
  title?: string;
  children: ReactNode;
  showCloseButton?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export function BaseModal({
  title,
  children,
  showCloseButton = true,
  maxWidth = 'md',
}: BaseModalProps) {
  return (
    <ModalContainer maxWidth={maxWidth}>
      {title && (
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
          {showCloseButton && (
            <CloseButton onClick={SnappyModal.close} type="button">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </CloseButton>
          )}
        </ModalHeader>
      )}
      <ModalContent>{children}</ModalContent>
    </ModalContainer>
  );
}

// Common Modal Components for reuse
export const ModalMessage = tw.p`
  text-gray-700
  mb-6
`;

export const ModalButtonGroup = tw.div`
  flex
  items-center
  justify-end
  gap-3
`;

export const ModalCancelButton = tw.button`
  px-4
  py-2
  text-gray-700
  border
  border-gray-300
  rounded-lg
  hover:bg-gray-50
  transition-colors
`;

export const ModalConfirmButton = tw.button`
  px-4
  py-2
  bg-blue-600
  text-white
  font-medium
  rounded-lg
  hover:bg-blue-700
  transition-colors
`;

export const ModalCenterButtonGroup = tw.div`
  flex
  items-center
  justify-center
`;

// Styled Components
const ModalContainer = tw.div<{ maxWidth: 'sm' | 'md' | 'lg' | 'xl' }>`
  bg-white
  rounded-lg
  shadow-xl
  ${(p) => {
    switch (p.maxWidth) {
      case 'sm':
        return 'max-w-sm';
      case 'md':
        return 'max-w-md';
      case 'lg':
        return 'max-w-lg';
      case 'xl':
        return 'max-w-xl';
      default:
        return 'max-w-md';
    }
  }}
  w-full
  mx-4
  max-h-[90vh]
  overflow-hidden
  flex
  flex-col
`;

const ModalHeader = tw.div`
  flex
  items-center
  justify-between
  px-6
  py-4
  border-b
  border-gray-200
`;

const ModalTitle = tw.h3`
  text-lg
  font-semibold
  text-gray-900
`;

const CloseButton = tw.button`
  p-1
  text-gray-400
  hover:text-gray-600
  hover:bg-gray-100
  rounded-lg
  transition-colors
`;

const ModalContent = tw.div`
  px-6
  py-4
  overflow-y-auto
`;
