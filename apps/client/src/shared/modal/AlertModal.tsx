import SnappyModal from 'react-snappy-modal';

import {
  BaseModal,
  ModalMessage,
  ModalCenterButtonGroup,
  ModalConfirmButton,
} from './BaseModal';

interface AlertModalProps {
  title?: string;
  message: string;
  confirmText?: string;
}

export function AlertModal({
  title = '알림',
  message,
  confirmText = '확인',
}: AlertModalProps) {
  const handleConfirm = () => {
    SnappyModal.close(true);
  };

  return (
    <BaseModal title={title} showCloseButton={false} maxWidth="sm">
      <ModalMessage>{message}</ModalMessage>
      <ModalCenterButtonGroup>
        <ModalConfirmButton onClick={handleConfirm} type="button">
          {confirmText}
        </ModalConfirmButton>
      </ModalCenterButtonGroup>
    </BaseModal>
  );
}

/* USAGE */
/*

// 기본 알림 모달
SnappyModal.show(
  <AlertModal
    title="알림"
    message="알림 메시지"
  />
).then((result) => {
  // result는 항상 true (확인 버튼 클릭)
  console.log('확인 버튼 클릭됨');
});

// 저장 완료 알림
SnappyModal.show(
  <AlertModal
    title="저장 완료"
    message="데이터가 성공적으로 저장되었습니다."
  />
).then((result) => {
  if (result) {
    // 확인 버튼 클릭 후 처리
    redirectToList();
  }
});

// 오류 알림
SnappyModal.show(
  <AlertModal
    title="오류"
    message="처리 중 오류가 발생했습니다."
    confirmText="닫기"
  />
).then((result) => {
  if (result) {
    // 오류 확인 후 처리
    resetForm();
  }
});

*/
