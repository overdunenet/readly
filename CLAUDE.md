# CLAUDE.md

이 파일은 Readly 프로젝트에서 Claude Code를 사용한 개발 시 가이드를 제공합니다.

## 프로젝트 개요

**Readly**는 에디터와 팔로워를 연결하는 유료 블로그 플랫폼입니다.

### 핵심 기능

- **에디터**: 블로그 포스트 작성 및 관리
- **팔로워**: 포스트 구매/구독을 통한 콘텐츠 접근
- **접근 권한**: 전체공개, 구독자 전용, 구매자 전용, 비공개

### 기술 스택

- **Backend**: tRPC + NestJS
- **Frontend**: React + Vite + Tailwind CSS
- **서비스 구성**:
  - Client (팔로워용)
  - Editor (에디터용)
  - Backoffice (관리자용)

## 문서 구조

자세한 내용은 `/docs` 폴더의 문서를 참조하세요:

- **[README.md](./docs/README.md)** - 문서 개요 및 네비게이션
- **[architecture.md](./docs/architecture.md)** - 시스템 아키텍처
- **[api-guide.md](./docs/api-guide.md)** - API 개발 가이드
- **[frontend-guide.md](./docs/frontend-guide.md)** - 프론트엔드 개발 가이드
- **[features.md](./docs/features.md)** - 기능 명세서

## 빠른 시작

### 개발 환경 설정

```bash
# 1. 의존성 설치
yarn install

# 2. 환경 변수 설정
cp .env.example .env

# 3. 데이터베이스 마이그레이션
yarn db:migrate

# 4. 개발 서버 시작
yarn dev
```

### 주요 명령어

- `yarn dev` - 모든 서비스 개발 서버 시작
- `yarn dev:api` - API 서버만 시작
- `yarn dev:client` - Client 앱만 시작
- `yarn dev:editor` - Editor 앱만 시작
- `yarn dev:backoffice` - Backoffice 앱만 시작
- `yarn test` - 테스트 실행
- `yarn lint` - 코드 린팅

## 개발 가이드

### API 엔드포인트 추가

1. `src/server/routers`에 라우터 파일 생성
2. tRPC 프로시저 정의
3. NestJS 서비스에 비즈니스 로직 구현
4. 루트 라우터에 등록

### 프론트엔드 페이지 추가

1. `src/routes/` 디렉토리에 파일 기반 라우팅으로 페이지 생성
2. `createFileRoute` 함수로 라우트 정의
3. 필요한 API 호출은 tRPC 클라이언트 사용

```typescript
// 예시: src/routes/_auth/editor/posts/create.tsx
import { createFileRoute } from '@tanstack/react-router';
import { trpc } from '../../../../shared/trpc';

export const Route = createFileRoute('/_auth/editor/posts/create')({
  component: CreatePostPage,
});

function CreatePostPage() {
  const createPostMutation = trpc.post.create.useMutation();
  // ...
}
```

### 인증 처리

- **Client/Editor**: JWT 기반 사용자 인증 + 쿠키 기반 refreshToken
- **Backoffice**: 별도 관리자 인증

#### 쿠키 기반 인증 패턴

```typescript
// CookieService를 통한 중앙 집중식 쿠키 관리
@Injectable()
export class CookieService {
  setRefreshTokenCookie(res: Response, refreshToken: string): void {
    this.setCookie(res, 'refreshToken', refreshToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
    });
  }
}

// Router에서 사용
async login(@Input('email') email: string, @Ctx() ctx: any) {
  const result = await this.microserviceClient.send('user.login', { email, password });

  // refreshToken은 쿠키로 설정
  this.cookieService.setRefreshTokenCookie(ctx.res, result.refreshToken);

  // accessToken만 응답으로 반환
  return {
    accessToken: result.accessToken,
    user: result.user,
  };
}
```

#### 프론트엔드 인증 초기화

```typescript
// beforeLoad에서 자동 인증 체크
beforeLoad: async () => {
  const { user } = useAuthStore.getState();
  if (user) return;

  await refreshAuth(); // refreshToken 쿠키로 자동 로그인 시도
},
```

### Repository 패턴 (중요)

**모든 데이터베이스 접근은 반드시 RepositoryProvider를 통해 이루어져야 합니다.**

#### 1. Service에서 Repository 사용

```typescript
// ❌ 잘못된 방법 - @InjectRepository 직접 사용
constructor(
  @InjectRepository(Entity)
  private repository: Repository<Entity>
) {}

// ✅ 올바른 방법 - RepositoryProvider 사용
constructor(
  private readonly repositoryProvider: RepositoryProvider
) {}

// 사용 예시
const user = await this.repositoryProvider.UserRepository.findOne({ where: { id } });
```

#### 2. 새로운 Repository 추가

```typescript
// 1. repository 함수 생성 (src/module/domain/repositories/post.repository.ts)
export const getPostRepository = (
  source?: TransactionService | EntityManager
) =>
  getEntityManager(source)
    .getRepository(PostEntity)
    .extend({
      // 커스텀 메서드 추가
      async findPublished() {
        return this.find({ where: { status: 'published' } });
      },
    });

// 2. RepositoryProvider에 추가
export class RepositoryProvider {
  get PostRepository() {
    return getPostRepository(this.transaction);
  }
}
```

#### 3. Module 설정

```typescript
// TypeOrmModule.forFeature 제거하고 SharedModule import
@Module({
  imports: [
    SharedModule, // RepositoryProvider 포함
    // TypeOrmModule.forFeature([Entity]) ❌ 제거
  ],
  providers: [PostService],
})
export class PostModule {}
```

#### Repository 패턴의 장점

- **트랜잭션 일관성**: 모든 DB 작업이 동일한 트랜잭션 컨텍스트에서 실행
- **자동 트랜잭션 관리**: POST, PUT, PATCH, DELETE 요청에 대해 자동으로 트랜잭션 적용
- **커스텀 메서드**: repository.extend()로 도메인 특화 메서드 추가 가능
- **테스트 용이성**: RepositoryProvider를 쉽게 mocking 가능

### DDD (Domain-Driven Design) 패턴

#### Entity 설계 원칙

**Entity는 자신의 생성과 검증 로직을 캡슐화해야 합니다.**

```typescript
@Entity('users')
export class UserEntity extends BaseEntity {
  @Column({ unique: true, type: 'varchar' })
  email: string;

  @Column({ type: 'varchar' })
  password: string;

  // ✅ 비즈니스 로직을 Entity 내부에 캡슐화
  async setPassword(plainPassword: string): Promise<void> {
    this.password = await bcrypt.hash(plainPassword, 10);
  }

  async checkPassword(plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, this.password);
  }

  // ✅ Static Factory Method 패턴
  static async register(input: {
    email: string;
    password: string;
    nickname: string;
  }): Promise<UserEntity> {
    const user = new UserEntity();
    user.email = input.email;
    user.nickname = input.nickname;
    await user.setPassword(input.password);
    return user;
  }
}
```

#### Service Layer 설계

**Service는 orchestration 역할만 담당하고, 비즈니스 로직은 Entity에 위임합니다.**

```typescript
// ❌ 잘못된 방법 - Service에서 직접 Entity 생성
async register(input: RegisterInput) {
  const user = new UserEntity();
  user.email = input.email;
  user.nickname = input.nickname;
  await user.setPassword(input.password);
  return this.repository.save(user);
}

// ✅ 올바른 방법 - Entity의 Factory Method 사용
async register(input: RegisterInput) {
  const user = await UserEntity.register(input);
  return this.repositoryProvider.UserRepository.save(user);
}
```

#### Repository 확장 패턴

```typescript
export const getUserRepository = (
  source?: TransactionService | EntityManager
) =>
  getEntityManager(source)
    .getRepository(UserEntity)
    .extend({
      async register(input: RegisterInput): Promise<UserEntity> {
        const user = await UserEntity.register(input); // DDD 패턴 적용
        return this.save(user);
      },
    });
```

### 인증 모듈 구현 패턴

#### JWT 설정

**ConfigProvider를 사용하여 일관된 설정 관리**

```typescript
// config.ts
export const ConfigProvider = {
  auth: {
    jwt: {
      user: config.get<AppJwtConfigType>('auth.jwt.user'),
      backoffice: config.get<AppJwtConfigType>('auth.jwt.backoffice'),
    }
  }
} as const;

// Module에서 사용
@Module({
  imports: [
    JwtModule.register({
      secret: ConfigProvider.auth.jwt.user.access.secret,
      signOptions: {
        expiresIn: ConfigProvider.auth.jwt.user.access.expiresIn,
      },
    }),
  ],
})
```

#### 에러 처리 패턴

```typescript
// ✅ findOneByOrFail + catch 패턴
const user = await this.repositoryProvider.UserRepository.findOneByOrFail({
  email,
}).catch(() => {
  throw new UnauthorizedException('Invalid email or password');
});

// ✅ Entity 메서드 결과 검증
const isPasswordValid = await user.checkPassword(password);
if (!isPasswordValid) {
  throw new UnauthorizedException('Invalid email or password');
}
```

#### tRPC Router 패턴

```typescript
@Router({ alias: 'user' })
export class UserRouter extends BaseTrpcRouter {
  /**
   * 사용자 로그인 (이메일/비밀번호)
   */
  @Mutation({
    input: loginCredentialsSchema,
    output: loginResponseSchema,
  })
  async login(
    @Input('email') email: string,
    @Input('password') password: string
  ) {
    try {
      return await this.microserviceClient.send('user.login', {
        email,
        password,
      });
    } catch (error) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: error.message || 'Login failed',
      });
    }
  }
}
```

### Repository 사용 패턴

#### 1. findBy 사용하기

**where 조건만 사용하는 경우 findBy를 사용합니다.**

```typescript
// ❌ 불필요하게 복잡한 방법
const users = await repository.find({
  where: { status: 'active' },
});

// ✅ 간단한 findBy 사용
const users = await repository.findBy({ status: 'active' });
```

#### 2. findOrFail 패턴

**결과가 없을 때 예외 처리가 필요한 경우 findOrFail 메서드를 사용합니다.**

```typescript
// ❌ 수동으로 검증하는 방법
const user = await repository.findOne({ where: { email } });
if (!user) {
  throw new NotFoundException('User not found');
}

// ✅ findOneOrFail + catch 패턴
const user = await repository
  .findOneOrFail({
    where: { email },
  })
  .catch(() => {
    throw new NotFoundException('User not found');
  });

// ✅ findOneByOrFail 사용 (where 조건만 있는 경우)
const user = await repository.findOneByOrFail({ email }).catch(() => {
  throw new NotFoundException('User not found');
});
```

#### 3. Soft Delete 자동 적용

**deletedAt은 자동으로 필터링되므로 명시적으로 조건에 포함하지 않습니다.**

```typescript
// ❌ 불필요한 deletedAt 조건
const user = await repository.findOneBy({ email, deletedAt: null });

// ✅ Soft Delete 자동 적용
const user = await repository.findOneBy({ email });
```

## 코딩 컨벤션

### TypeScript

- 명시적 타입 선언 선호
- interface over type alias
- 엄격한 null 체크

### React

- 함수형 컴포넌트 사용
- Custom hooks로 로직 분리
- Tailwind CSS 클래스 사용

### 스타일링 (tw-styled-components)

- **styled components 정의 위치**: 파일 하단에 '// Styled Components' 주석과 함께 배치
- **가독성 우선**: 비즈니스 로직과 스타일링 코드 분리
- **모바일 우선 디자인**: 모바일 뷰에 최적화 (md:max-w-md)

```typescript
// ✅ 올바른 구조
import tw from 'tailwind-styled-components';

// 비즈니스 로직
const Component = () => {
  return <Container>...</Container>;
};

export default Component;

// Styled Components
const Container = tw.div`
  min-h-screen
  bg-white
`;
```

### 라우팅 (TanStack Router)

- **파일 기반 라우팅**: `src/routes/` 디렉토리 구조
- **레이아웃 컴포넌트**: 공통 레이아웃은 별도 컴포넌트로 분리
- **라우트 정의**: createFileRoute 사용
- **인증 라우트**: `_auth` prefix로 인증이 필요한 페이지 그룹화

```typescript
// 레이아웃 라우트 예시: src/routes/_auth/editor.tsx
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

// 자식 라우트: src/routes/_auth/editor/posts/create.tsx
export const Route = createFileRoute('/_auth/editor/posts/create')({
  component: CreatePostPage,
});
```

### 폼 검증 (React Hook Form + Zod)

**모든 폼은 React Hook Form과 Zod를 사용한 타입 안전한 검증을 적용합니다.**

```typescript
// 1. Zod 스키마 정의
const createPostSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요').max(200, '제목은 200자 이하로 입력해주세요'),
  content: z.string().min(1, '내용을 입력해주세요'),
  accessLevel: z.enum(['public', 'subscriber', 'purchaser', 'private']),
  price: z.number().min(0, '가격은 0원 이상이어야 합니다').optional(),
});

type CreatePostForm = z.infer<typeof createPostSchema>;

// 2. useForm 설정
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

// 3. Controller로 필드 래핑
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

// 4. 조건부 필드
const watchedAccessLevel = watch('accessLevel');
{watchedAccessLevel === 'purchaser' && (
  <PriceField />
)}
```

### 모달 시스템 (react-snappy-modal)

**프로젝트에서는 react-snappy-modal을 사용하여 일관된 모달 UI를 제공합니다.**

#### 기본 설정

```typescript
// main.tsx - 앱 최상위에 Provider 설정
import { SnappyModalProvider } from 'react-snappy-modal';

<SnappyModalProvider>
  <App />
</SnappyModalProvider>
```

#### 모달 컴포넌트 구조

- **BaseModal**: 기본 모달 레이아웃과 공통 스타일 컴포넌트 제공
- **AlertModal**: 알림용 모달 (확인 버튼 1개)
- **ConfirmModal**: 확인/취소 모달 (버튼 2개)

#### AlertModal 사용법

```typescript
import SnappyModal from 'react-snappy-modal';
import { AlertModal } from '@/shared/modal/AlertModal';

// 기본 사용
SnappyModal.show(
  <AlertModal
    title="알림"
    message="작업이 완료되었습니다."
  />
).then((result) => {
  // result는 항상 true (확인 버튼 클릭)
  if (result) {
    console.log('확인됨');
  }
});

// 에러 처리에서 사용
const createPostMutation = trpc.post.create.useMutation({
  onError: (error) => {
    SnappyModal.show(
      <AlertModal
        title="포스트 작성 실패"
        message={error.message}
      />
    );
  },
});
```

#### ConfirmModal 사용법

```typescript
import { ConfirmModal } from '@/shared/modal/ConfirmModal';

// 삭제 확인
SnappyModal.show(
  <ConfirmModal
    title="삭제 확인"
    message="정말 삭제하시겠습니까?"
    confirmText="삭제"
    cancelText="취소"
  />
).then((result) => {
  if (result === true) {
    // 확인 버튼 클릭 - 삭제 진행
    deleteItem();
  } else if (result === false) {
    // 취소 버튼 클릭 - 아무것도 하지 않음
    console.log('삭제 취소');
  }
});
```

#### 커스텀 모달

```typescript
import { BaseModal } from '@/shared/modal/BaseModal';

SnappyModal.show(
  <BaseModal title="커스텀 모달" maxWidth="lg">
    <div>커스텀 내용</div>
    <button onClick={SnappyModal.close}>닫기</button>
  </BaseModal>
);
```

#### 모달 모범 사례

- **명확한 제목과 메시지**: 사용자가 쉽게 이해할 수 있도록
- **적절한 버튼 텍스트**: "삭제", "저장", "취소" 등 액션을 명확히 표현
- **결과 처리**: ConfirmModal은 반드시 `.then()`으로 결과 처리
- **일관된 사용**: 프로젝트 전반에 걸쳐 동일한 패턴 사용

자세한 사용법은 [`/src/shared/modal/README.md`](./apps/client/src/shared/modal/README.md)를 참조하세요.

### API

- RESTful 원칙 준수
- 에러 처리 표준화
- 입력 검증 필수
- tRPC를 통한 타입 안전한 API 호출

## 폴더 구조

```
readly/
├── apps/
│   ├── api/          # tRPC + NestJS API
│   ├── client/       # 팔로워용 React 앱
│   ├── editor/       # 에디터용 React 앱
│   └── backoffice/   # 관리자용 React 앱
├── packages/
│   ├── shared/       # 공통 유틸리티
│   └── ui/           # 공통 UI 컴포넌트
├── docs/             # 프로젝트 문서
└── CLAUDE.md         # 이 파일
```

## 문제 해결

일반적인 문제와 해결책은 각 문서의 Troubleshooting 섹션을 참조하세요.
