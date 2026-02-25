import { Eye, EyeOff, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import SnappyModal from 'react-snappy-modal';
import tw from 'tailwind-styled-components';

import { ConfirmModal } from '@/shared/modal/ConfirmModal';

interface PostActionsProps {
  postId: string;
  status: 'draft' | 'published' | 'scheduled';
  onEdit: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
  onDelete: () => void;
}

const PostActions = ({
  status,
  onEdit,
  onPublish,
  onUnpublish,
  onDelete,
}: PostActionsProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => setIsOpen((prev) => !prev);
  const handleClose = () => setIsOpen(false);

  const handleEdit = () => {
    handleClose();
    onEdit();
  };

  const handlePublishToggle = () => {
    handleClose();
    if (status === 'published') {
      onUnpublish();
    } else {
      onPublish();
    }
  };

  const handleDelete = () => {
    handleClose();
    SnappyModal.show(
      <ConfirmModal
        title="포스트 삭제"
        message="이 포스트를 삭제하시겠습니까? 삭제된 포스트는 복구할 수 없습니다."
        confirmText="삭제"
        cancelText="취소"
      />,
    ).then((result) => {
      if (result) {
        onDelete();
      }
    });
  };

  return (
    <Container>
      <TriggerButton onClick={handleToggle}>
        <MoreVertical size={18} />
      </TriggerButton>

      {isOpen && (
        <>
          <Overlay onClick={handleClose} />
          <Dropdown>
            <MenuItem onClick={handleEdit}>
              <Pencil size={16} />
              수정
            </MenuItem>
            <MenuItem onClick={handlePublishToggle}>
              {status === 'published' ? (
                <>
                  <EyeOff size={16} />
                  발행 취소
                </>
              ) : (
                <>
                  <Eye size={16} />
                  발행
                </>
              )}
            </MenuItem>
            <DeleteMenuItem onClick={handleDelete}>
              <Trash2 size={16} />
              삭제
            </DeleteMenuItem>
          </Dropdown>
        </>
      )}
    </Container>
  );
};

export default PostActions;

// Styled Components
const Container = tw.div`
  relative
`;

const TriggerButton = tw.button`
  p-1
  rounded
  hover:bg-gray-100
  transition-colors
  text-gray-500
  hover:text-gray-700
`;

const Overlay = tw.div`
  fixed
  inset-0
  z-40
`;

const Dropdown = tw.div`
  absolute
  right-0
  mt-2
  w-48
  bg-white
  rounded-lg
  shadow-lg
  border
  border-gray-200
  py-2
  z-50
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
`;

const DeleteMenuItem = tw.button`
  w-full
  px-4
  py-2
  text-left
  text-sm
  text-red-600
  hover:bg-red-50
  flex
  items-center
  gap-3
  transition-colors
`;
