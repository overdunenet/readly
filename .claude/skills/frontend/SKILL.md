---
name: Frontend-Development
description: 프론트엔드 개발 가이드. React, TanStack Router, 폼, 모달.
keywords: [Frontend, React, TanStack Router, Zustand, tRPC, 폼, 모달]
estimated_tokens: ~1000
---

# Frontend 개발 스킬

## 개요

Readly의 프론트엔드는 React, Vite, Tailwind CSS 기반입니다.

> 상세 아키텍처는 `.claude/context/architecture/frontend.md` 참조

## 프로젝트 구조

```
apps/{client,editor,backoffice}/src/
├── components/       # UI 컴포넌트
│   ├── layout/      # 레이아웃 컴포넌트
│   └── shared/      # 공유 컴포넌트
├── routes/          # TanStack Router 페이지 (파일 기반 라우팅)
├── hooks/           # Custom hooks
├── stores/          # Zustand stores
├── shared/          # 공유 유틸리티
│   ├── trpc.ts     # tRPC 클라이언트
│   └── modal/      # 모달 컴포넌트
└── App.tsx
```

## 컴포넌트 작성 패턴

### 기본 구조

```typescript
import tw from 'tailwind-styled-components';

interface Props {
  title: string;
  onSubmit: () => void;
}

const MyComponent = ({ title, onSubmit }: Props) => {
  return (
    <Container>
      <Title>{title}</Title>
      <Button onClick={onSubmit}>저장</Button>
    </Container>
  );
};

export default MyComponent;

// Styled Components (파일 하단에 배치)
const Container = tw.div`
  min-h-screen
  bg-white
`;

const Title = tw.h1`
  text-2xl
  font-bold
  text-gray-900
`;

const Button = tw.button`
  px-4
  py-2
  bg-blue-600
  text-white
  rounded-md
  hover:bg-blue-700
`;
```

## 라우팅 (TanStack Router)

### 파일 기반 라우팅 구조

```
src/routes/
├── __root.tsx        # 루트 레이아웃
├── index.tsx         # 홈 페이지 (/)
├── login.tsx         # 로그인 (/login)
└── _auth/            # 인증 필요 라우트 그룹
    ├── editor.tsx    # 에디터 레이아웃
    └── editor/
        ├── index.tsx       # /editor
        └── posts/
            └── create.tsx  # /editor/posts/create
```

### 인증 라우트 패턴

```typescript
// src/routes/__root.tsx
export const Route = createRootRoute({
  beforeLoad: async () => {
    const { user } = useAuthStore.getState();
    if (user) return;
    await refreshAuth(); // refreshToken 쿠키로 자동 로그인
  },
  component: RootComponent,
});

// src/routes/_auth/editor.tsx - 레이아웃 라우트
export const Route = createFileRoute('/_auth/editor')({
  component: EditorLayout,
});

function EditorLayout() {
  return (
    <>
      <EditorHeader />
      <Container>
        <EditorLeftMenu />
        <MainContent>
          <Outlet />
        </MainContent>
      </Container>
    </>
  );
}
```

## 폼 처리 (React Hook Form + Zod)

```typescript
const schema = z.object({
  title: z.string().min(1, '제목을 입력해주세요'),
  content: z.string().min(1, '내용을 입력해주세요'),
  accessLevel: z.enum(['public', 'subscriber', 'purchaser', 'private']),
});

type FormType = z.infer<typeof schema>;

const MyForm = () => {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<FormType>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="title"
        control={control}
        render={({ field }) => (
          <Input {...field} hasError={!!errors.title} />
        )}
      />
      {errors.title && <ErrorMessage>{errors.title.message}</ErrorMessage>}
    </form>
  );
};
```

## 상태 관리 (Zustand)

```typescript
interface AuthState {
  user: User | null;
  accessToken: string | null;
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>(set => ({
  user: null,
  accessToken: null,
  setUser: user => set({ user }),
  setAccessToken: token => set({ accessToken: token }),
  logout: () => set({ user: null, accessToken: null }),
}));
```

## 모달 시스템 (react-snappy-modal)

```typescript
import SnappyModal from 'react-snappy-modal';
import { AlertModal, ConfirmModal } from '@/shared/modal';

// Alert
SnappyModal.show(
  <AlertModal title="알림" message="작업이 완료되었습니다." />
);

// Confirm
SnappyModal.show(
  <ConfirmModal
    title="삭제 확인"
    message="정말 삭제하시겠습니까?"
    confirmText="삭제"
    cancelText="취소"
  />
).then((result) => {
  if (result === true) deleteItem();
});
```

## tRPC 호출

```typescript
const { data, isLoading } = trpc.post.getMy.useQuery();

const createMutation = trpc.post.create.useMutation({
  onSuccess: () => {
    queryClient.invalidateQueries(['post']);
  },
  onError: (error) => {
    SnappyModal.show(<AlertModal title="오류" message={error.message} />);
  },
});
```

## 스타일링 규칙

1. **Styled Components 위치**: 파일 하단 `// Styled Components` 주석과 함께
2. **클래스 작성**: 한 줄에 하나씩
3. **모바일 우선**: `md:max-w-md md:mx-auto`
4. **아이콘**: lucide-react 사용 (인라인 SVG 지양), size prop으로 크기 지정 (네비게이션: 24, 메뉴 아이템: 16)

## 에디터 (Rich Text)

**CKEditor 5 사용** (`ckeditor5` + `@ckeditor/ckeditor5-react`)

```typescript
import { CKEditor } from '@ckeditor/ckeditor5-react';
import { ClassicEditor, Essentials, Paragraph, Heading, Bold, Italic, Underline, Strikethrough, List, BlockQuote, CodeBlock, Link, Image, ImageInsert, Base64UploadAdapter, RemoveFormat, EditorConfig } from 'ckeditor5';
import 'ckeditor5/ckeditor5.css';

const editorConfig: EditorConfig = {
  plugins: [Essentials, Paragraph, Heading, Bold, Italic, Underline, Strikethrough, List, BlockQuote, CodeBlock, Link, Image, ImageInsert, Base64UploadAdapter, RemoveFormat],
  toolbar: ['heading', '|', 'bold', 'italic', 'underline', 'strikethrough', '|', 'numberedList', 'bulletedList', '|', 'blockQuote', 'codeBlock', '|', 'link', 'insertImage', '|', 'removeFormat'],
  placeholder: '내용을 입력하세요',
};

<Controller
  name="content"
  control={control}
  render={({ field }) => (
    <CKEditor
      editor={ClassicEditor}
      config={editorConfig}
      data={field.value}
      onChange={(_event, editor) => field.onChange(editor.getData())}
    />
  )}
/>
```

## 체크리스트

### 컴포넌트 작성

- [ ] tailwind-styled-components 사용
- [ ] Styled Components 파일 하단 배치
- [ ] 한 줄에 하나의 클래스 작성

### 라우팅

- [ ] 인증 필요 페이지는 `_auth/` 하위에 배치
- [ ] 레이아웃은 `<Outlet />` 포함

### 폼

- [ ] React Hook Form + Zod 검증
- [ ] Controller로 필드 연결
- [ ] mode: 'onChange' 실시간 검증

### API

- [ ] trpc hook 사용
- [ ] onError에서 AlertModal 표시
- [ ] 성공 시 queryClient.invalidateQueries
