import SnappyModal from 'react-snappy-modal';

import {
  BaseModal,
  ModalMessage,
  ModalButtonGroup,
  ModalCancelButton,
  ModalConfirmButton,
} from './BaseModal';

interface ConfirmModalProps {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export function ConfirmModal({
  title = '확인',
  message,
  confirmText = '확인',
  cancelText = '취소',
}: ConfirmModalProps) {
  const handleCancel = () => {
    SnappyModal.close(false);
  };

  const handleConfirm = () => {
    SnappyModal.close(true);
  };

  return (
    <BaseModal title={title} showCloseButton={false} maxWidth="sm">
      <ModalMessage>{message}</ModalMessage>
      <ModalButtonGroup>
        <ModalCancelButton onClick={handleCancel} type="button">
          {cancelText}
        </ModalCancelButton>
        <ModalConfirmButton onClick={handleConfirm} type="button">
          {confirmText}
        </ModalConfirmButton>
      </ModalButtonGroup>
    </BaseModal>
  );
}

/* USAGE */
/*

SnappyModal.show(
  <ConfirmModal
    title="확인"
    message="확인 메시지"
  />
).then(result => {
  if (result) {
    onConfirm();
  } else {
    onCancel();
  }
});
 */
