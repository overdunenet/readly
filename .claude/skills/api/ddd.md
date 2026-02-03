---
name: DDD-Pattern
description: DDD 패턴 가이드. Entity 비즈니스 로직 캡슐화, Service 오케스트레이션 역할.
keywords:
  [DDD, Domain-Driven Design, Entity, Service, Factory Method, 비즈니스 로직]
estimated_tokens: ~700
---

# DDD 패턴 (Domain-Driven Design)

**Entity는 자신의 비즈니스 로직을 캡슐화하고, Service는 오케스트레이션만 담당합니다.**

## Entity 설계 원칙

Entity가 담당해야 할 로직:

- 자기 자신의 상태 변경
- 유효성 검증
- 비즈니스 규칙 판단
- Factory Method를 통한 생성

```typescript
@Entity('posts')
export class PostEntity extends BaseEntity {
  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'varchar', default: 'draft' })
  status: 'draft' | 'published' | 'archived';

  @Column({ type: 'varchar', default: 'public' })
  accessLevel: 'public' | 'subscriber' | 'purchaser' | 'private';

  // ✅ Static Factory Method - 생성 로직 캡슐화
  static create(input: CreatePostInput): PostEntity {
    const post = new PostEntity();
    post.title = input.title;
    post.content = input.content;
    post.authorId = input.authorId;
    post.status = 'draft';
    return post;
  }

  // ✅ 상태 변경 메서드 - 비즈니스 규칙 포함
  publish(): void {
    if (this.status === 'archived') {
      throw new BadRequestException('보관된 포스트는 발행할 수 없습니다');
    }
    this.status = 'published';
    this.publishedAt = new Date();
  }

  unpublish(): void {
    this.status = 'draft';
    this.publishedAt = null;
  }

  archive(): void {
    this.status = 'archived';
  }

  // ✅ 접근 권한 판단 - Entity가 자신의 규칙을 알고 있음
  canAccess(user?: UserEntity): boolean {
    if (this.accessLevel === 'public') return true;
    if (!user) return false;
    if (this.authorId === user.id) return true;

    switch (this.accessLevel) {
      case 'subscriber':
        return user.isSubscriberOf(this.authorId);
      case 'purchaser':
        return user.hasPurchased(this.id);
      default:
        return false;
    }
  }

  // ✅ 수정 권한 판단
  canEdit(userId: string): boolean {
    return this.authorId === userId;
  }

  // ✅ 데이터 업데이트 메서드
  update(input: UpdatePostInput): void {
    if (input.title) this.title = input.title;
    if (input.content) this.content = input.content;
    if (input.accessLevel) this.accessLevel = input.accessLevel;
  }
}
```

## Service 레이어 역할

Service가 담당해야 할 로직:

- 오케스트레이션 (여러 Entity/Repository 조율)
- 외부 서비스 호출
- 트랜잭션 경계 설정
- **비즈니스 로직은 Entity에 위임**

```typescript
@Injectable()
export class PostService {
  constructor(private repositoryProvider: RepositoryProvider) {}

  // ✅ 올바른 패턴 - Entity 메서드 활용
  async createPost(authorId: string, input: CreateInput) {
    // Entity Factory Method 사용
    const post = PostEntity.create({ ...input, authorId });
    return this.repositoryProvider.PostRepository.save(post);
  }

  // ✅ 올바른 패턴 - Entity에 상태 변경 위임
  async publishPost(postId: string, userId: string) {
    const post = await this.repositoryProvider.PostRepository.findOneByOrFail({
      id: postId,
    }).catch(() => {
      throw new NotFoundException('포스트를 찾을 수 없습니다');
    });

    // 권한 검증은 Entity가 담당
    if (!post.canEdit(userId)) {
      throw new ForbiddenException('수정 권한이 없습니다');
    }

    // 상태 변경은 Entity가 담당 (비즈니스 규칙 포함)
    post.publish();

    return this.repositoryProvider.PostRepository.save(post);
  }

  // ❌ 잘못된 패턴 - Service에서 직접 상태 변경
  async publishPostBad(postId: string, userId: string) {
    const post = await this.repositoryProvider.PostRepository.findOneByOrFail({
      id: postId,
    });

    // ❌ Service에서 직접 비즈니스 규칙 판단
    if (post.authorId !== userId) {
      throw new ForbiddenException('수정 권한이 없습니다');
    }

    // ❌ Service에서 직접 상태 변경
    if (post.status === 'archived') {
      throw new BadRequestException('보관된 포스트는 발행할 수 없습니다');
    }
    post.status = 'published';
    post.publishedAt = new Date();

    return this.repositoryProvider.PostRepository.save(post);
  }
}
```

## Entity vs Service 책임 분리

| 로직 유형        | Entity | Service |
| ---------------- | ------ | ------- |
| 생성 (Factory)   | ✅     |         |
| 상태 변경        | ✅     |         |
| 유효성 검증      | ✅     |         |
| 권한 판단        | ✅     |         |
| Repository 호출  |        | ✅      |
| 여러 Entity 조율 |        | ✅      |
| 외부 API 호출    |        | ✅      |
| 트랜잭션 관리    |        | ✅      |

## 체크리스트

- [ ] Entity Factory Method로 생성
- [ ] 상태 변경 로직은 Entity 메서드로 구현
- [ ] 권한 검증 로직은 Entity에 구현
- [ ] Service는 오케스트레이션만 담당
- [ ] Service에서 Entity 속성 직접 변경 금지
