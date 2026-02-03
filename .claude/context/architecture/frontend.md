---
name: Frontend-Architecture
description: 프론트엔드 TanStack Router, 인증 흐름, tRPC 클라이언트 설정.
keywords: [프론트엔드, React, TanStack Router, Zustand, tRPC, 인증]
estimated_tokens: ~900
---

# 프론트엔드 아키텍처 상세

## 디렉토리 구조

```
apps/client/src/
├── routes/                  # TanStack Router 파일 기반 라우팅
│   ├── __root.tsx           # 루트 레이아웃 (인증 초기화)
│   ├── index.tsx            # 홈페이지 (/)
│   ├── login.tsx            # 로그인 (/login)
│   ├── _auth.tsx            # 인증 레이아웃 wrapper
│   └── _auth/
│       └── editor/
│           ├── index.tsx        # 에디터 홈
│           └── posts/
│               ├── index.tsx    # 포스트 목록
│               └── create.tsx   # 포스트 작성
├── components/
│   ├── layout/              # 레이아웃 컴포넌트
│   ├── editor/              # 에디터 관련 컴포넌트
│   └── posts/               # 포스트 관련 컴포넌트
├── shared/
│   ├── trpc/                # tRPC 클라이언트
│   │   ├── trpc.ts          # 클라이언트 설정
│   │   └── providers.tsx    # Provider 컴포넌트
│   └── modal/               # 모달 시스템
├── stores/                  # Zustand 스토어
│   └── auth.ts
├── hooks/                   # Custom Hooks
│   └── useAuth.ts
└── utils/
    └── auth.ts              # refreshAuth 함수
```

## 인증 흐름

### 1. 초기 로드 (페이지 새로고침)

```
__root.tsx beforeLoad
    ↓
useAuthStore.getState().user 확인
    ↓
user 없으면 → refreshAuth() 호출
    ↓
POST /trpc/user.refreshToken (쿠키 포함)
    ↓
성공: accessToken, user 저장
실패: 로그인 필요
```

### 2. 로그인

```typescript
// useAuth hook
const login = async (email, password) => {
  const result = await trpc.user.login.mutate({ email, password });
  // refreshToken은 서버에서 쿠키로 설정됨
  // accessToken, user는 응답으로 받음
  useAuthStore.getState().login({
    accessToken: result.accessToken,
    user: result.user,
  });
};
```

### 3. API 요청 (자동 토큰 갱신)

```typescript
// trpc.ts httpLink 설정
const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: 'http://localhost:3000/trpc',
      credentials: 'include', // 쿠키 포함
      async headers() {
        const token = useAuthStore.getState().accessToken;
        return token ? { Authorization: `Bearer ${token}` } : {};
      },
      async fetch(url, options) {
        const response = await fetch(url, options);

        if (response.status === 401) {
          // 토큰 갱신 시도
          const refreshed = await refreshAccessToken();
          if (refreshed) {
            // 새 토큰으로 재시도
            return fetch(url, { ...options, headers: newHeaders });
          }
          // 갱신 실패 → 로그아웃
          useAuthStore.getState().logout();
        }

        return response;
      },
    }),
  ],
});
```

### 4. 토큰 갱신

```typescript
// utils/auth.ts
export const refreshAuth = async (): Promise<boolean> => {
  const response = await fetch('/trpc/user.refreshToken', {
    method: 'POST',
    credentials: 'include', // refreshToken 쿠키 포함
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });

  if (!response.ok) return false;

  const data = await response.json();
  const result = data.result?.data;

  if (result?.accessToken && result?.user) {
    useAuthStore.getState().setAccessToken(result.accessToken);
    useAuthStore.getState().setUser(result.user);
    return true;
  }

  return false;
};
```

## TanStack Router 구조

### 파일 기반 라우팅 규칙

| 파일명                          | 라우트                         |
| ------------------------------- | ------------------------------ |
| `__root.tsx`                    | 루트 레이아웃                  |
| `index.tsx`                     | `/`                            |
| `login.tsx`                     | `/login`                       |
| `_auth.tsx`                     | 인증 wrapper (URL에 표시 안됨) |
| `_auth/editor.tsx`              | `/editor` 레이아웃             |
| `_auth/editor/index.tsx`        | `/editor`                      |
| `_auth/editor/posts/create.tsx` | `/editor/posts/create`         |

### 라우트 정의 패턴

```typescript
// 기본 라우트
export const Route = createFileRoute('/login')({
  component: LoginPage,
});

// 레이아웃 라우트
export const Route = createFileRoute('/_auth/editor')({
  component: EditorLayout,
});

function EditorLayout() {
  return (
    <>
      <EditorHeader />
      <Outlet /> {/* 자식 라우트 렌더링 */}
    </>
  );
}

// beforeLoad 훅 (인증 체크)
export const Route = createRootRoute({
  beforeLoad: async () => {
    const { user } = useAuthStore.getState();
    if (!user) await refreshAuth();
  },
  component: RootComponent,
});
```

## tRPC 클라이언트

### Provider 설정

```typescript
// shared/trpc/providers.tsx
export function TRPCProvider({ children }: { children: React.ReactNode }) {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
```

### 사용 예시

```typescript
// Query
const { data, isLoading } = trpc.post.getMy.useQuery();

// Mutation
const createMutation = trpc.post.create.useMutation({
  onSuccess: () => {
    queryClient.invalidateQueries(['post']);
  },
  onError: (error) => {
    SnappyModal.show(<AlertModal title="오류" message={error.message} />);
  },
});
```

## 상태 관리 (Zustand)

### AuthStore

```typescript
interface AuthState {
  user: User | null;
  accessToken: string | null;
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  login: (data: { user: User; accessToken: string }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>(set => ({
  user: null,
  accessToken: null,
  setUser: user => set({ user }),
  setAccessToken: accessToken => set({ accessToken }),
  login: ({ user, accessToken }) => set({ user, accessToken }),
  logout: () => set({ user: null, accessToken: null }),
}));
```

## 컴포넌트 체크리스트

1. **페이지 컴포넌트**
   - [ ] `createFileRoute` 사용
   - [ ] 인증 필요 시 `_auth/` 하위에 배치

2. **레이아웃 컴포넌트**
   - [ ] `<Outlet />` 포함
   - [ ] Styled Components 파일 하단 배치

3. **폼 컴포넌트**
   - [ ] Zod 스키마 정의
   - [ ] React Hook Form 사용
   - [ ] Controller로 필드 연결

4. **API 호출**
   - [ ] trpc hook 사용
   - [ ] onError에서 AlertModal 표시
