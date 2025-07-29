# Modal 사용 가이드

Readly 프로젝트에서 모달을 사용하는 방법에 대한 가이드입니다.

## 📦 구성 요소

- **BaseModal**: 기본 모달 레이아웃과 공통 컴포넌트 제공
- **AlertModal**: 알림용 모달 (확인 버튼 1개)
- **ConfirmModal**: 확인/취소 모달 (버튼 2개)

## 🚀 기본 설정

모달 사용을 위해서는 앱 최상위에 `SnappyModalProvider`가 설정되어 있어야 합니다.

```tsx
// main.tsx
import { SnappyModalProvider } from 'react-snappy-modal';

<SnappyModalProvider>
  <App />
</SnappyModalProvider>
```

## 📋 AlertModal 사용법

### 기본 사용

```tsx
import SnappyModal from 'react-snappy-modal';
import { AlertModal } from '@/shared/modal/AlertModal';

// 기본 알림
SnappyModal.show(
  <AlertModal
    title="알림"
    message="작업이 완료되었습니다."
  />
).then((result) => {
  // result는 항상 true (확인 버튼 클릭)
  console.log('확인 버튼 클릭됨');
});
```

### Props 설명

```tsx
interface AlertModalProps {
  title?: string;        // 모달 제목 (기본값: '알림')
  message: string;       // 알림 메시지 (필수)
  confirmText?: string;  // 확인 버튼 텍스트 (기본값: '확인')
}
```

### 결과 처리

AlertModal은 `Promise<boolean>`을 반환합니다:
- `true`: 확인 버튼 클릭 (항상 true)

### 사용 예시

```tsx
// 성공 알림
SnappyModal.show(
  <AlertModal
    title="저장 완료"
    message="데이터가 성공적으로 저장되었습니다."
  />
).then((result) => {
  if (result) {
    // 확인 후 처리
    navigate('/list');
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

// 정보 알림 (결과 처리 없이)
SnappyModal.show(
  <AlertModal
    message="새로운 업데이트가 있습니다."
  />
);
```

## ✅ ConfirmModal 사용법

### 기본 사용

```tsx
import SnappyModal from 'react-snappy-modal';
import { ConfirmModal } from '@/shared/modal/ConfirmModal';

// 확인/취소 모달
SnappyModal.show(
  <ConfirmModal
    title="삭제 확인"
    message="정말 삭제하시겠습니까?"
    confirmText="삭제"
    cancelText="취소"
  />
).then((result) => {
  if (result === true) {
    // 확인 버튼 클릭
    console.log('삭제 진행');
  } else if (result === false) {
    // 취소 버튼 클릭 또는 모달 닫기
    console.log('삭제 취소');
  }
});
```

### Props 설명

```tsx
interface ConfirmModalProps {
  title?: string;        // 모달 제목 (기본값: '확인')
  message: string;       // 확인 메시지 (필수)
  confirmText?: string;  // 확인 버튼 텍스트 (기본값: '확인')
  cancelText?: string;   // 취소 버튼 텍스트 (기본값: '취소')
}
```

### 결과 처리

ConfirmModal은 `Promise<boolean>`을 반환합니다:
- `true`: 확인 버튼 클릭
- `false`: 취소 버튼 클릭 또는 모달 닫기

### 사용 예시

```tsx
// 삭제 확인
const handleDelete = () => {
  SnappyModal.show(
    <ConfirmModal
      title="포스트 삭제"
      message="이 포스트를 삭제하시겠습니까? 복구할 수 없습니다."
      confirmText="삭제"
      cancelText="취소"
    />
  ).then((result) => {
    if (result) {
      deletePost();
    }
  });
};

// 페이지 이탈 확인
const handleNavigateAway = () => {
  SnappyModal.show(
    <ConfirmModal
      title="페이지 이탈"
      message="작성 중인 내용이 있습니다. 정말 나가시겠습니까?"
      confirmText="나가기"
      cancelText="머물기"
    />
  ).then((result) => {
    if (result) {
      navigate('/other-page');
    }
  });
};

// 설정 초기화
const handleReset = () => {
  SnappyModal.show(
    <ConfirmModal
      message="모든 설정을 초기화하시겠습니까?"
      confirmText="초기화"
    />
  ).then((result) => {
    if (result) {
      resetSettings();
      SnappyModal.show(
        <AlertModal message="설정이 초기화되었습니다." />
      );
    }
  });
};
```

## 🎨 BaseModal 사용법

커스텀 모달이 필요한 경우 BaseModal을 직접 사용할 수 있습니다.

```tsx
import SnappyModal from 'react-snappy-modal';
import { BaseModal } from '@/shared/modal/BaseModal';

SnappyModal.show(
  <BaseModal 
    title="커스텀 모달" 
    maxWidth="lg"
    showCloseButton={true}
  >
    <div>커스텀 내용</div>
    <button onClick={SnappyModal.close}>닫기</button>
  </BaseModal>
);
```

### Props 설명

```tsx
interface BaseModalProps {
  title?: string;                           // 모달 제목
  children: ReactNode;                      // 모달 내용
  showCloseButton?: boolean;                // X 버튼 표시 여부 (기본값: true)
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';    // 최대 너비 (기본값: 'md')
}
```

### 공통 스타일 컴포넌트

BaseModal에서 제공하는 공통 컴포넌트들:

```tsx
import { 
  ModalMessage,
  ModalButtonGroup,
  ModalCenterButtonGroup,
  ModalCancelButton,
  ModalConfirmButton 
} from '@/shared/modal/BaseModal';

// 사용 예시
<BaseModal title="커스텀 모달">
  <ModalMessage>메시지 내용</ModalMessage>
  <ModalButtonGroup>
    <ModalCancelButton onClick={handleCancel}>취소</ModalCancelButton>
    <ModalConfirmButton onClick={handleConfirm}>확인</ModalConfirmButton>
  </ModalButtonGroup>
</BaseModal>
```

## 🎯 모범 사례

### DO ✅

```tsx
// 명확한 제목과 메시지 사용
SnappyModal.show(
  <ConfirmModal
    title="포스트 삭제"
    message="이 작업은 되돌릴 수 없습니다. 정말 삭제하시겠습니까?"
  />
);

// 적절한 버튼 텍스트 사용
SnappyModal.show(
  <ConfirmModal
    message="변경사항을 저장하시겠습니까?"
    confirmText="저장"
    cancelText="저장 안함"
  />
);

// 결과에 따른 적절한 처리
SnappyModal.show(<ConfirmModal />).then((result) => {
  if (result) {
    performAction();
  }
});
```

### DON'T ❌

```tsx
// 애매한 메시지
SnappyModal.show(
  <AlertModal message="작업 완료" /> // 무엇이 완료되었는지 불분명
);

// 결과 처리 없이 ConfirmModal 사용
SnappyModal.show(<ConfirmModal message="삭제하시겠습니까?" />);
// .then() 없이 사용하면 사용자 선택이 무시됨

// 너무 긴 메시지
SnappyModal.show(
  <AlertModal message="매우 길고 복잡한 메시지가 여기에..." />
);
```

## 🔧 문제 해결

### 모달이 표시되지 않는 경우
1. `SnappyModalProvider`가 앱 최상위에 있는지 확인
2. CSS가 올바르게 로드되었는지 확인

### 스타일링 문제
1. `index.css`에 모달 관련 CSS가 있는지 확인
2. Tailwind CSS 클래스가 제대로 적용되는지 확인

### TypeScript 오류
1. 올바른 props 타입을 사용하고 있는지 확인
2. 필수 props (`message`)가 전달되었는지 확인