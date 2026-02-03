# 공통 개발 패턴

## TypeScript 규칙

- 명시적 타입 선언 선호
- `interface` over `type alias`
- 엄격한 null 체크

## 네이밍 컨벤션

### 파일명

| 유형     | 규칙                        | 예시             |
| -------- | --------------------------- | ---------------- |
| 컴포넌트 | PascalCase                  | `PostCard.tsx`   |
| 훅       | camelCase (use prefix)      | `useAuth.ts`     |
| 유틸리티 | camelCase                   | `formatDate.ts`  |
| 스토어   | camelCase                   | `authStore.ts`   |
| Entity   | PascalCase + Entity suffix  | `PostEntity.ts`  |
| Router   | PascalCase + Router suffix  | `PostRouter.ts`  |
| Service  | PascalCase + Service suffix | `PostService.ts` |

### 변수/함수명

| 유형    | 규칙                    | 예시                        |
| ------- | ----------------------- | --------------------------- |
| 변수    | camelCase               | `postList`, `isLoading`     |
| 함수    | camelCase (동사 prefix) | `getPost`, `createUser`     |
| 상수    | UPPER_SNAKE_CASE        | `MAX_POST_LENGTH`           |
| Boolean | is/has/can prefix       | `isActive`, `hasPermission` |

## Git 컨벤션

### 브랜치명

```
feature/기능명
fix/버그명
refactor/리팩토링내용
```

### 커밋 메시지

```
feat: 새 기능 추가
fix: 버그 수정
refactor: 코드 리팩토링
docs: 문서 수정
style: 코드 스타일 변경
test: 테스트 추가/수정
chore: 빌드/설정 변경
```

### 커밋 규칙

1. **수정한 파일만 add** (git add -A 금지)
2. **한 커밋에 하나의 논리적 변경**
3. **빌드 에러가 없는 상태로 커밋**

## 에러 처리 패턴

### Backend

```typescript
// findOrFail + catch 패턴
const entity = await repository.findOneByOrFail({ id }).catch(() => {
  throw new NotFoundException('Entity not found');
});
```

### Frontend

```typescript
// Mutation 에러 처리
const mutation = trpc.post.create.useMutation({
  onError: (error) => {
    SnappyModal.show(
      <AlertModal title="오류" message={error.message} />
    );
  },
});
```

## Import 순서

```typescript
// 1. 외부 라이브러리
import { useState } from 'react';
import { z } from 'zod';

// 2. 내부 모듈 (절대 경로)
import { useAuthStore } from '@/stores/auth';
import { trpc } from '@/shared/trpc';

// 3. 상대 경로
import { PostCard } from './PostCard';

// 4. 타입
import type { Post } from '@/types';

// 5. 스타일
import tw from 'tailwind-styled-components';
```

## 코드 품질 체크

```bash
# 린트 실행
yarn lint

# 타입 체크
yarn typecheck

# 빌드 테스트
yarn build
```
