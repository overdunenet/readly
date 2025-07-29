# 프론트엔드 개발 가이드

## 개요

Readly의 프론트엔드는 React, Vite, Tailwind CSS를 기반으로 구축된 3개의 독립적인 애플리케이션으로 구성됩니다. 이 가이드는 각 애플리케이션의 개발 방법과 모범 사례를 설명합니다.

## 애플리케이션 구조

### 1. Client (팔로워용)

- **URL**: https://readly.com
- **대상**: 일반 사용자, 콘텐츠 소비자
- **주요 기능**: 포스트 열람, 구매, 구독

### 2. Editor (에디터용)

- **URL**: https://editor.readly.com
- **대상**: 콘텐츠 제작자
- **주요 기능**: 포스트 작성, 수익 관리, 분석

### 3. Backoffice (관리자용)

- **URL**: https://admin.readly.com
- **대상**: 플랫폼 관리자
- **주요 기능**: 사용자 관리, 콘텐츠 모더레이션, 시스템 설정

## 프로젝트 구조

```
apps/
├── client/
│   ├── src/
│   │   ├── components/       # UI 컴포넌트
│   │   │   ├── layout/      # 레이아웃 컴포넌트 (Header, Layout)
│   │   │   └── feed/        # 피드 관련 컴포넌트 (FeedCard)
│   │   ├── routes/          # TanStack Router 페이지 (파일 기반 라우팅)
│   │   ├── hooks/           # Custom hooks
│   │   ├── stores/          # Zustand stores
│   │   ├── utils/           # 유틸리티 함수
│   │   ├── styles/          # 글로벌 스타일
│   │   └── App.tsx          # 앱 진입점 (Router 설정)
│   ├── public/              # 정적 파일
│   └── index.html
├── editor/                  # Editor 앱 (동일 구조)
└── backoffice/             # Backoffice 앱 (동일 구조)
```

## 개발 환경 설정

### 1. 기본 설정

```bash
# 프로젝트 루트에서
yarn install

# 개별 앱 실행
yarn workspace @readly/client dev
yarn workspace @readly/editor dev
yarn workspace @readly/backoffice dev

# 모든 앱 동시 실행
yarn dev:all
```

### 2. 환경 변수

```env
# apps/client/.env
VITE_API_URL=http://localhost:3000
VITE_APP_URL=http://localhost:5173

# apps/editor/.env
VITE_API_URL=http://localhost:3000
VITE_APP_URL=http://localhost:5174

# apps/backoffice/.env
VITE_API_URL=http://localhost:3000
VITE_APP_URL=http://localhost:5175
```

## React 컴포넌트 개발

### 1. 함수형 컴포넌트

```tsx
// src/components/PostCard.tsx
import { FC } from 'react';
import { Post } from '@readly/types';
import { formatDate, formatPrice } from '@/utils';

interface PostCardProps {
  post: Post;
  onPurchase?: (postId: string) => void;
}

export const PostCard: FC<PostCardProps> = ({ post, onPurchase }) => {
  const handlePurchase = () => {
    onPurchase?.(post.id);
  };

  return (
    <article className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
      <header>
        <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>{post.author.name}</span>
          <time>{formatDate(post.createdAt)}</time>
        </div>
      </header>

      <p className="mt-4 text-gray-700 line-clamp-3">{post.excerpt}</p>

      <footer className="mt-4 flex items-center justify-between">
        {post.accessType === 'paid' && (
          <span className="font-semibold">{formatPrice(post.price)}</span>
        )}

        <button
          onClick={handlePurchase}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {post.accessType === 'paid' ? '구매하기' : '읽기'}
        </button>
      </footer>
    </article>
  );
};
```

### 2. Custom Hooks

```tsx
// src/hooks/useAuth.ts
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth';
import { api } from '@/api';

export const useAuth = () => {
  const { user, setUser, logout } = useAuthStore();

  useEffect(() => {
    // 토큰 검증 및 사용자 정보 로드
    const loadUser = async () => {
      try {
        const userData = await api.auth.me.query();
        setUser(userData);
      } catch (error) {
        logout();
      }
    };

    if (!user) {
      loadUser();
    }
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    logout,
  };
};
```

### 3. 폼 처리 (React Hook Form + Zod)

React Hook Form과 Zod를 사용한 타입 안전한 폼 구현:

```tsx
// src/routes/_auth/editor/posts/create.tsx
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import tw from 'tailwind-styled-components';
import { trpc } from '../../../../shared/trpc';

// Zod 스키마 정의
const createPostSchema = z.object({
  title: z
    .string()
    .min(1, '제목을 입력해주세요')
    .max(200, '제목은 200자 이하로 입력해주세요'),
  content: z.string().min(1, '내용을 입력해주세요'),
  excerpt: z.string().max(500, '요약은 500자 이하로 입력해주세요').optional(),
  accessLevel: z.enum(['public', 'subscriber', 'purchaser', 'private']),
  price: z.number().min(0, '가격은 0원 이상이어야 합니다').optional(),
});

type CreatePostForm = z.infer<typeof createPostSchema>;

export const PostForm = () => {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<CreatePostForm>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      title: '',
      content: '',
      accessLevel: 'public',
      price: 0,
    },
    mode: 'onChange', // 실시간 검증
  });

  const watchedAccessLevel = watch('accessLevel');
  const createPostMutation = trpc.post.create.useMutation();

  const onSubmit = async (data: CreatePostForm) => {
    try {
      await createPostMutation.mutateAsync({
        ...data,
        price: data.accessLevel === 'purchaser' ? data.price : undefined,
      });
    } catch (error) {
      console.error('Post creation failed:', error);
    }
  };

  return (
    <Form>
      <FormSection>
        <FormField>
          <Label>제목 *</Label>
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <TitleInput
                {...field}
                placeholder="포스트 제목을 입력하세요"
                hasError={!!errors.title}
              />
            )}
          />
          {errors.title && <ErrorMessage>{errors.title.message}</ErrorMessage>}
        </FormField>

        {/* 접근 권한 라디오 버튼 */}
        <FormField>
          <Label>접근 권한 *</Label>
          <Controller
            name="accessLevel"
            control={control}
            render={({ field }) => (
              <AccessLevelGrid>
                {accessLevelOptions.map(option => (
                  <AccessLevelOption key={option.value}>
                    <AccessLevelRadio
                      {...field}
                      type="radio"
                      value={option.value}
                      id={option.value}
                      checked={field.value === option.value}
                    />
                    <AccessLevelLabel
                      htmlFor={option.value}
                      isSelected={field.value === option.value}
                    >
                      <AccessLevelTitle>{option.label}</AccessLevelTitle>
                      <AccessLevelDescription>
                        {option.description}
                      </AccessLevelDescription>
                    </AccessLevelLabel>
                  </AccessLevelOption>
                ))}
              </AccessLevelGrid>
            )}
          />
        </FormField>

        {/* 조건부 가격 필드 */}
        {watchedAccessLevel === 'purchaser' && (
          <FormField>
            <Label>판매 가격 *</Label>
            <Controller
              name="price"
              control={control}
              render={({ field }) => (
                <PriceInputWrapper>
                  <PriceInput
                    {...field}
                    type="number"
                    onChange={e => field.onChange(Number(e.target.value))}
                    hasError={!!errors.price}
                  />
                  <PriceUnit>원</PriceUnit>
                </PriceInputWrapper>
              )}
            />
          </FormField>
        )}
      </FormSection>

      <ActionButtons>
        <SaveButton
          onClick={() => handleSubmit(onSubmit)()}
          disabled={!isValid}
          type="button"
        >
          임시저장
        </SaveButton>
        <PublishButton
          onClick={() => handleSubmit(onSubmit)()}
          disabled={!isValid}
          type="button"
        >
          발행
        </PublishButton>
      </ActionButtons>
    </Form>
  );
};

// Styled Components
const Form = tw.div`
  space-y-8
`;

const FormSection = tw.div`
  bg-white
  rounded-lg
  border
  border-gray-200
  p-6
  space-y-6
`;

const FormField = tw.div`
  space-y-2
`;

const Label = tw.label`
  block
  text-sm
  font-medium
  text-gray-700
`;

const TitleInput = tw.input<{ hasError?: boolean }>`
  w-full
  px-3
  py-2
  border
  ${p => (p.hasError ? 'border-red-300' : 'border-gray-300')}
  rounded-lg
  focus:outline-none
  focus:ring-2
  focus:ring-blue-500
  focus:border-transparent
  text-lg
  font-medium
`;

const AccessLevelGrid = tw.div`
  grid
  grid-cols-1
  md:grid-cols-2
  gap-4
`;

const AccessLevelOption = tw.div`
  relative
`;

const AccessLevelRadio = tw.input`
  sr-only
`;

const AccessLevelLabel = tw.label<{ isSelected: boolean }>`
  block
  p-4
  border
  ${p => (p.isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200')}
  rounded-lg
  cursor-pointer
  transition-colors
`;

const ErrorMessage = tw.p`
  text-sm
  text-red-600
`;
```

## 상태 관리 (Zustand)

### 1. Store 정의 (쿠키 기반 인증)

```tsx
// src/stores/auth.ts
import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  nickname: string;
  profileImage: string | null;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  logout: () => void;
}

// persist 제거 - accessToken은 메모리에만 저장, refreshToken은 쿠키에 저장
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,

  setUser: user => set({ user }),
  setAccessToken: accessToken => set({ accessToken }),

  logout: () => {
    set({ user: null, accessToken: null });
    // 로그아웃 API 호출로 쿠키 제거
    fetch('/trpc/user.logout', {
      method: 'POST',
      credentials: 'include',
    });
  },

  // computed value로 인증 상태 확인
  get isAuthenticated() {
    return !!get().user;
  },
}));

// 인증 관련 유틸리티 함수
export const refreshAuth = async (): Promise<boolean> => {
  try {
    const response = await fetch('/trpc/user.refreshToken', {
      method: 'POST',
      credentials: 'include', // 쿠키 포함
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
  } catch {
    return false;
  }
};
```

### 2. 복잡한 상태 관리

```tsx
// src/stores/posts.ts
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface PostsState {
  posts: Post[];
  filters: {
    category?: string;
    accessType?: string;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  setPosts: (posts: Post[]) => void;
  addPost: (post: Post) => void;
  updatePost: (id: string, updates: Partial<Post>) => void;
  setFilters: (filters: PostsState['filters']) => void;
  setPagination: (pagination: Partial<PostsState['pagination']>) => void;
}

export const usePostsStore = create<PostsState>()(
  subscribeWithSelector(set => ({
    posts: [],
    filters: {},
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
    },
    setPosts: posts => set({ posts }),
    addPost: post =>
      set(state => ({
        posts: [post, ...state.posts],
      })),
    updatePost: (id, updates) =>
      set(state => ({
        posts: state.posts.map(post =>
          post.id === id ? { ...post, ...updates } : post
        ),
      })),
    setFilters: filters =>
      set({ filters, pagination: { page: 1, limit: 20, total: 0 } }),
    setPagination: pagination =>
      set(state => ({
        pagination: { ...state.pagination, ...pagination },
      })),
  }))
);

// 선택자
export const useFilteredPosts = () => {
  return usePostsStore(state => {
    const { posts, filters } = state;
    return posts.filter(post => {
      if (filters.category && post.category !== filters.category) return false;
      if (filters.accessType && post.accessType !== filters.accessType)
        return false;
      return true;
    });
  });
};
```

## 라우팅 (TanStack Router)

### 1. 파일 기반 라우팅

TanStack Router의 파일 기반 라우팅을 사용합니다:

```
src/routes/
├── __root.tsx              # 루트 레이아웃
├── index.tsx              # 홈 페이지 (/)
├── login.tsx              # 로그인 페이지 (/login)
├── register.tsx           # 회원가입 페이지 (/register)
└── _auth/                 # 인증이 필요한 라우트 그룹
    ├── editor.tsx         # 에디터 레이아웃 (/editor)
    └── editor/
        ├── index.tsx      # 대시보드 (/editor)
        ├── posts.tsx      # 포스트 관리 (/editor/posts)
        ├── posts/
        │   └── create.tsx # 포스트 작성 (/editor/posts/create)
        ├── analytics.tsx  # 분석 (/editor/analytics)
        ├── revenue.tsx    # 수익 관리 (/editor/revenue)
        └── settings.tsx   # 설정 (/editor/settings)
```

#### 인증 라우트 패턴

- `_auth` prefix: 인증이 필요한 라우트 그룹
- beforeLoad hook에서 자동 인증 체크
- 레이아웃 라우트로 공통 UI 구성

### 2. 라우터 설정

```tsx
// src/App.tsx
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export function App() {
  return <RouterProvider router={router} />;
}
```

### 3. 라우트 정의 및 인증 처리

```tsx
// src/routes/__root.tsx - 루트 레이아웃
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { refreshAuth } from '../utils/auth';
import { useAuthStore } from '../stores/auth';

export const Route = createRootRoute({
  // 전역 beforeLoad에서 인증 체크
  beforeLoad: async () => {
    const { user } = useAuthStore.getState();
    if (user) return;

    await refreshAuth(); // refreshToken 쿠키로 자동 로그인 시도
  },
  component: RootComponent,
});

function RootComponent() {
  return <Outlet />;
}

// src/routes/_auth/editor.tsx - 레이아웃 라우트
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { useState } from 'react';
import tw from 'tailwind-styled-components';
import EditorHeader from '../../components/editor/EditorHeader';
import EditorLeftMenu from '../../components/editor/EditorLeftMenu';

export const Route = createFileRoute('/_auth/editor')({
  component: EditorLayout,
});

function EditorLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      <EditorHeader />
      <Container>
        <EditorLeftMenu
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
        <MainContent>
          <Outlet />
        </MainContent>
      </Container>
    </>
  );
}

// Styled Components
const Container = tw.div`
  flex
  min-h-screen
  bg-gray-50
  pt-14
`;

const MainContent = tw.main`
  flex-1
  lg:ml-auto
  min-h-[calc(100vh-3.5rem)]
`;

// src/routes/_auth/editor/posts/create.tsx - 자식 라우트
import { createFileRoute } from '@tanstack/react-router';
import tw from 'tailwind-styled-components';

export const Route = createFileRoute('/_auth/editor/posts/create')({
  component: CreatePostPage,
});

function CreatePostPage() {
  return <Container>{/* 포스트 생성 폼 */}</Container>;
}

// Styled Components
const Container = tw.div`
  max-w-4xl
  mx-auto
  p-6
  lg:p-8
`;
```

### 2. 보호된 라우트

```tsx
// src/components/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  requiredRole?: string;
}

export const ProtectedRoute = ({ requiredRole }: ProtectedRouteProps) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};
```

## tRPC 클라이언트 설정

### 1. 클라이언트 초기화

```tsx
// src/api/client.ts
import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { AppRouter } from '@readly/api';

export const api = createTRPCReact<AppRouter>();

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5분
      cacheTime: 10 * 60 * 1000, // 10분
    },
  },
});

export const trpcClient = api.createClient({
  links: [
    httpBatchLink({
      url: `${import.meta.env.VITE_API_URL}/trpc`,
      headers() {
        const token = localStorage.getItem('auth-token');
        return token ? { authorization: `Bearer ${token}` } : {};
      },
    }),
  ],
});
```

### 2. Provider 설정

```tsx
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { api, queryClient, trpcClient } from './api/client';
import { App } from './App';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <api.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </api.Provider>
  </React.StrictMode>
);
```

### 3. API 호출

```tsx
// src/pages/Posts.tsx
import { api } from '@/api';

export const Posts = () => {
  const { data, isLoading, error } = api.posts.list.useQuery({
    page: 1,
    limit: 20,
  });

  const createPost = api.posts.create.useMutation({
    onSuccess: () => {
      // 캐시 무효화
      queryClient.invalidateQueries(['posts', 'list']);
    },
  });

  if (isLoading) return <div>로딩 중...</div>;
  if (error) return <div>에러: {error.message}</div>;

  return (
    <div>
      {data?.posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
};
```

## Tailwind CSS & tw-styled-components

### 1. tw-styled-components 사용법

```tsx
// src/components/ui/Card.tsx
import tw from 'tailwind-styled-components';

interface CardProps {
  children: React.ReactNode;
  title?: string;
}

const Card = ({ children, title }: CardProps) => {
  return (
    <CardContainer>
      {title && <CardTitle>{title}</CardTitle>}
      <CardContent>{children}</CardContent>
    </CardContainer>
  );
};

export default Card;

// Styled Components
const CardContainer = tw.div`
  bg-white
  rounded-lg
  shadow-sm
  hover:shadow-md
  transition-shadow
  p-6
`;

const CardTitle = tw.h3`
  text-xl
  font-semibold
  mb-4
  text-gray-900
`;

const CardContent = tw.div`
  text-gray-700
`;
```

### 2. 모바일 우선 디자인

```tsx
// src/components/layout/Layout.tsx
import tw from 'tailwind-styled-components';

const Layout = ({ children }: LayoutProps) => {
  return (
    <LayoutContainer>
      <Header />
      <MainContent>{children}</MainContent>
    </LayoutContainer>
  );
};

// Styled Components
const LayoutContainer = tw.div`
  min-h-screen
  bg-gray-50
`;

const MainContent = tw.main`
  pt-14
  md:max-w-md
  md:mx-auto
  min-h-screen
  bg-white
`;
```

### 3. 코딩 컨벤션

- **Styled Components 위치**: 파일 하단에 `// Styled Components` 주석과 함께 배치
- **명명 규칙**: PascalCase 사용 (예: CardContainer, HeaderTitle)
- **가독성**: 한 줄에 하나의 클래스씩 작성

```tsx
// ❌ 나쁜 예
const Button = tw.button`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700`;

// ✅ 좋은 예
const Button = tw.button`
  px-4
  py-2
  bg-blue-600
  text-white
  rounded-md
  hover:bg-blue-700
```

## 성능 최적화

### 1. 코드 스플리팅

```tsx
// 라우트 레벨 스플리팅
const Dashboard = lazy(() => import('./pages/Dashboard'));

// 컴포넌트 레벨 스플리팅
const HeavyComponent = lazy(() => import('./components/HeavyComponent'));

<Suspense fallback={<Loading />}>
  <HeavyComponent />
</Suspense>;
```

### 2. 메모이제이션

```tsx
// src/components/ExpensiveList.tsx
import { memo, useMemo } from 'react';

interface ListProps {
  items: Item[];
  filter: string;
}

export const ExpensiveList = memo<ListProps>(({ items, filter }) => {
  const filteredItems = useMemo(() => {
    return items.filter(item =>
      item.name.toLowerCase().includes(filter.toLowerCase())
    );
  }, [items, filter]);

  return (
    <ul>
      {filteredItems.map(item => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
});
```

### 3. 이미지 최적화

```tsx
// src/components/OptimizedImage.tsx
interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
}

export const OptimizedImage = ({
  src,
  alt,
  className,
}: OptimizedImageProps) => {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={className}
      srcSet={`
        ${src}?w=640 640w,
        ${src}?w=1280 1280w,
        ${src}?w=1920 1920w
      `}
      sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
    />
  );
};
```

## 테스트

### 1. 컴포넌트 테스트

```tsx
// src/components/__tests__/PostCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { PostCard } from '../PostCard';

describe('PostCard', () => {
  const mockPost = {
    id: '1',
    title: '테스트 포스트',
    excerpt: '테스트 내용',
    author: { name: '작성자' },
    createdAt: new Date(),
    accessType: 'paid',
    price: 5000,
  };

  it('renders post information', () => {
    render(<PostCard post={mockPost} />);

    expect(screen.getByText('테스트 포스트')).toBeInTheDocument();
    expect(screen.getByText('작성자')).toBeInTheDocument();
    expect(screen.getByText('₩5,000')).toBeInTheDocument();
  });

  it('calls onPurchase when button clicked', () => {
    const handlePurchase = jest.fn();
    render(<PostCard post={mockPost} onPurchase={handlePurchase} />);

    fireEvent.click(screen.getByText('구매하기'));
    expect(handlePurchase).toHaveBeenCalledWith('1');
  });
});
```

### 2. Hook 테스트

```tsx
// src/hooks/__tests__/useAuth.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useAuth } from '../useAuth';

describe('useAuth', () => {
  it('loads user on mount', async () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.isAuthenticated).toBe(false);

    await waitFor(() => {
      expect(result.current.user).toBeDefined();
      expect(result.current.isAuthenticated).toBe(true);
    });
  });
});
```

## 배포

### 1. 빌드 최적화

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: true,
      gzipSize: true,
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@headlessui/react', '@heroicons/react'],
        },
      },
    },
  },
});
```

### 2. 환경별 설정

```typescript
// src/config/env.ts
const config = {
  development: {
    apiUrl: 'http://localhost:3000',
    enableDevTools: true,
  },
  staging: {
    apiUrl: 'https://staging-api.readly.com',
    enableDevTools: true,
  },
  production: {
    apiUrl: 'https://api.readly.com',
    enableDevTools: false,
  },
};

export const env = config[import.meta.env.MODE] || config.development;
```

## 모범 사례

### 1. 컴포넌트 구조

- 하나의 컴포넌트는 하나의 책임만
- Props 타입 명시적 정의
- 컴포넌트 파일과 동일한 이름의 export

### 2. 상태 관리

- 로컬 상태는 useState 사용
- 전역 상태는 Zustand 사용
- 서버 상태는 React Query (tRPC) 사용

### 3. 스타일링

- Tailwind 유틸리티 클래스 우선 사용
- 복잡한 스타일은 컴포넌트로 추상화
- 일관된 spacing과 color 사용

### 4. 성능

- 불필요한 리렌더링 방지
- 큰 리스트는 가상화 고려
- 이미지와 폰트 최적화

이 가이드를 통해 Readly의 프론트엔드를 효과적으로 개발할 수 있습니다.
