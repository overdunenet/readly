import { DataSources } from '@src/database/datasources';
import {
  getTestingEntityManager,
  getTestingModule,
  testingRepositoryProvider,
} from '@test/jest-util';
import { TestingModule } from '@nestjs/testing';
import { PostService } from './post.service';
import { EntityManager } from 'typeorm';
import { UserEntity } from '../domain/user.entity';
import {
  PostAccessLevel,
  POST_STATUS,
  PostEntity,
} from '../domain/post.entity';
import { SAVE_TYPE } from '../domain/post-version.entity';
import { BookstoreEntity } from '../domain/bookstore.entity';
import { Language } from '../domain/enums';

// --- Integration Tests ---

describe('PostService - getAccessiblePosts (Integration)', () => {
  let app: TestingModule;
  let service: PostService;
  let entityManager: EntityManager;

  const createTestUser = async (
    overrides?: Partial<{ email: string; nickname: string }>
  ) => {
    const user = new UserEntity();
    user.email =
      overrides?.email ??
      `test-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@example.com`;
    user.nickname =
      overrides?.nickname ?? `user-${Math.random().toString(36).slice(2, 7)}`;
    return testingRepositoryProvider.UserRepository.save(user);
  };

  const createTestBookstore = async (userId: string) => {
    const bookstore = BookstoreEntity.create({
      userId,
      penName: '테스트필명',
      storeName: '테스트서점',
      language: Language.KO,
    });
    return testingRepositoryProvider.BookstoreRepository.save(bookstore);
  };

  const createTestPost = async (
    authorId: string,
    overrides?: Partial<{
      title: string;
      freeContent: string;
      accessLevel: PostAccessLevel;
      publish: boolean;
    }>
  ) => {
    const post = await service.createPost(authorId, {
      title: overrides?.title ?? '테스트 포스트',
      freeContent: overrides?.freeContent ?? '테스트 내용입니다.',
      accessLevel: overrides?.accessLevel ?? 'public',
    });

    if (overrides?.publish !== false) {
      return service.publishPost(post.id, authorId);
    }
    return post;
  };

  beforeAll(async () => {
    await DataSources.readly.initialize();
    app = await getTestingModule();
    service = app.get(PostService);
  });

  afterAll(async () => {
    await app.close();
    await DataSources.readly.destroy();
  });

  beforeEach(async () => {
    entityManager = await getTestingEntityManager();
  });

  afterEach(async () => {
    if (entityManager?.queryRunner?.isTransactionActive) {
      await entityManager.queryRunner.rollbackTransaction();
    }
    if (entityManager?.queryRunner && !entityManager.queryRunner.isReleased) {
      await entityManager.queryRunner.release();
    }
  });

  it('published + public 포스트만 반환한다', async () => {
    const user = await createTestUser();
    await createTestBookstore(user.id);

    // draft 포스트 1개
    await createTestPost(user.id, { title: 'Draft', publish: false });
    // published + public 포스트 2개
    await createTestPost(user.id, { title: 'Published 1' });
    await createTestPost(user.id, { title: 'Published 2' });

    const result = await service.getAccessiblePosts();

    expect(result).toHaveLength(2);
    expect(result.every(p => p.status === 'published')).toBe(true);
    expect(result.every(p => p.accessLevel === 'public')).toBe(true);
  });

  it('publishedAt DESC 순서로 정렬된다', async () => {
    const user = await createTestUser();
    await createTestBookstore(user.id);

    await createTestPost(user.id, { title: '먼저 작성' });
    await createTestPost(user.id, { title: '나중에 작성' });

    const result = await service.getAccessiblePosts();

    expect(result.length).toBeGreaterThanOrEqual(2);
    const titles = result.map(p => p.title);
    expect(titles.indexOf('나중에 작성')).toBeLessThan(
      titles.indexOf('먼저 작성')
    );
  });

  it('author 정보가 포함된다', async () => {
    const user = await createTestUser({ nickname: '테스트작가' });
    await createTestBookstore(user.id);
    await createTestPost(user.id, { title: 'Author 테스트' });

    const result = await service.getAccessiblePosts();

    const post = result.find(p => p.title === 'Author 테스트');
    expect(post).toBeDefined();
    expect(post!.author).toBeDefined();
    expect(post!.author.id).toBe(user.id);
    expect(post!.author.nickname).toBe('테스트작가');
  });

  it('private 포스트는 반환하지 않는다', async () => {
    const user = await createTestUser();
    await createTestBookstore(user.id);

    await createTestPost(user.id, {
      title: 'Private Post',
      accessLevel: 'private',
    });
    await createTestPost(user.id, {
      title: 'Public Post',
      accessLevel: 'public',
    });

    const result = await service.getAccessiblePosts();

    expect(result.every(p => p.accessLevel === 'public')).toBe(true);
    expect(result.find(p => p.title === 'Private Post')).toBeUndefined();
  });

  it('포스트가 없으면 빈 배열을 반환한다', async () => {
    const result = await service.getAccessiblePosts();

    expect(result).toEqual([]);
  });
});

// --- Unit Tests ---

describe('PostEntity.canAccessPaidContent', () => {
  const createPost = (overrides: {
    authorId?: string;
    status?: string;
    accessLevel?: string;
  }) => {
    const post = new PostEntity();
    post.authorId = overrides.authorId ?? 'author-1';
    post.status = (overrides.status ?? POST_STATUS.PUBLISHED) as any;
    post.accessLevel = (overrides.accessLevel ?? 'public') as any;
    return post;
  };

  describe('Given 작성자가 요청할 때', () => {
    it('When 발행된 포스트이면 Then 접근 가능하다', () => {
      const post = createPost({});
      expect(post.canAccessPaidContent('author-1')).toBe(true);
    });

    it('When 미발행(draft) 포스트이면 Then 접근 가능하다', () => {
      const post = createPost({ status: POST_STATUS.DRAFT });
      expect(post.canAccessPaidContent('author-1')).toBe(true);
    });

    it('When private 포스트이면 Then 접근 가능하다', () => {
      const post = createPost({ accessLevel: 'private' });
      expect(post.canAccessPaidContent('author-1')).toBe(true);
    });
  });

  describe('Given 비작성자가 요청할 때', () => {
    describe('When 발행된 public 포스트이면', () => {
      it('Then 접근 가능하다', () => {
        const post = createPost({ accessLevel: 'public' });
        expect(post.canAccessPaidContent('other-user')).toBe(true);
      });
    });

    describe('When 발행된 private 포스트이면', () => {
      it('Then 접근 불가하다', () => {
        const post = createPost({ accessLevel: 'private' });
        expect(post.canAccessPaidContent('other-user')).toBe(false);
      });
    });

    describe('When 발행된 subscriber 포스트이면', () => {
      it('Then 접근 불가하다 (구독 로직 추후 구현)', () => {
        const post = createPost({ accessLevel: 'subscriber' });
        expect(post.canAccessPaidContent('other-user')).toBe(false);
      });
    });

    describe('When 발행된 purchaser 포스트이면', () => {
      it('Then 접근 불가하다 (구매 로직 추후 구현)', () => {
        const post = createPost({ accessLevel: 'purchaser' });
        expect(post.canAccessPaidContent('other-user')).toBe(false);
      });
    });

    describe('When 미발행(draft) 포스트이면', () => {
      it('Then 접근 불가하다', () => {
        const post = createPost({ status: POST_STATUS.DRAFT });
        expect(post.canAccessPaidContent('other-user')).toBe(false);
      });
    });
  });

  describe('Given 비로그인 사용자(null)가 요청할 때', () => {
    it('When public 포스트이면 Then 접근 가능하다', () => {
      const post = createPost({ accessLevel: 'public' });
      expect(post.canAccessPaidContent(null)).toBe(true);
    });

    it('When subscriber 포스트이면 Then 접근 불가하다', () => {
      const post = createPost({ accessLevel: 'subscriber' });
      expect(post.canAccessPaidContent(null)).toBe(false);
    });

    it('When purchaser 포스트이면 Then 접근 불가하다', () => {
      const post = createPost({ accessLevel: 'purchaser' });
      expect(post.canAccessPaidContent(null)).toBe(false);
    });

    it('When private 포스트이면 Then 접근 불가하다', () => {
      const post = createPost({ accessLevel: 'private' });
      expect(post.canAccessPaidContent(null)).toBe(false);
    });

    it('When 미발행 포스트이면 Then 접근 불가하다', () => {
      const post = createPost({ status: POST_STATUS.DRAFT });
      expect(post.canAccessPaidContent(null)).toBe(false);
    });
  });
});

describe('PostService - saveDraft (Integration)', () => {
  let app: TestingModule;
  let service: PostService;
  let entityManager: EntityManager;

  const createTestUser = async () => {
    const user = new UserEntity();
    user.email = `test-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@example.com`;
    user.nickname = `user-${Math.random().toString(36).slice(2, 7)}`;
    return testingRepositoryProvider.UserRepository.save(user);
  };

  const createTestBookstore = async (userId: string) => {
    const bookstore = BookstoreEntity.create({
      userId,
      penName: '테스트필명',
      storeName: '테스트서점',
      language: Language.KO,
    });
    return testingRepositoryProvider.BookstoreRepository.save(bookstore);
  };

  beforeAll(async () => {
    await DataSources.readly.initialize();
    app = await getTestingModule();
    service = app.get(PostService);
  });

  afterAll(async () => {
    await app.close();
    await DataSources.readly.destroy();
  });

  beforeEach(async () => {
    entityManager = await getTestingEntityManager();
  });

  afterEach(async () => {
    if (entityManager?.queryRunner?.isTransactionActive) {
      await entityManager.queryRunner.rollbackTransaction();
    }
    if (entityManager?.queryRunner && !entityManager.queryRunner.isReleased) {
      await entityManager.queryRunner.release();
    }
  });

  describe('saveDraft', () => {
    describe('Given: latest.saveType === auto && latest !== publishedVersion', () => {
      it('should overwrite latest version and apply saveType', async () => {
        // Given
        const user = await createTestUser();
        await createTestBookstore(user.id);
        const created = await service.createPost(user.id, {
          title: 'Original',
          freeContent: 'Original content',
        });

        // 최초 버전을 auto로 저장하여 auto 버전 생성
        await service.saveDraft(
          created.id,
          user.id,
          { title: 'Auto saved' },
          SAVE_TYPE.AUTO
        );

        // When: auto 버전 위에 다시 saveDraft(manual)
        const result = await service.saveDraft(
          created.id,
          user.id,
          { title: 'Updated Title', freeContent: 'Updated content' },
          SAVE_TYPE.MANUAL
        );

        // Then
        expect(result.title).toBe('Updated Title');
        expect(result.freeContent).toBe('Updated content');
      });
    });

    describe('Given: latest.saveType === manual', () => {
      it('should create a new version and apply saveType', async () => {
        // Given
        const user = await createTestUser();
        await createTestBookstore(user.id);
        const created = await service.createPost(user.id, {
          title: 'Original',
          freeContent: 'Original content',
        });

        // When: manual 위에 auto saveDraft
        const result = await service.saveDraft(
          created.id,
          user.id,
          { title: 'Auto Draft' },
          SAVE_TYPE.AUTO
        );

        // Then: 새 버전 생성됨 (title 변경, freeContent 기존 유지)
        expect(result.title).toBe('Auto Draft');
        expect(result.freeContent).toBe('Original content');

        // 버전 수 확인
        const versions =
          await testingRepositoryProvider.PostVersionRepository.find({
            where: { postId: created.id },
            order: { versionNumber: 'ASC' },
          });
        expect(versions).toHaveLength(2);
        expect(versions[1].saveType).toBe(SAVE_TYPE.AUTO);
      });
    });

    describe('Given: latest === publishedVersion', () => {
      it('should create a new version', async () => {
        // Given
        const user = await createTestUser();
        await createTestBookstore(user.id);
        const created = await service.createPost(user.id, {
          title: 'Original',
          freeContent: 'Original content',
        });
        await service.publishPost(created.id, user.id);

        // When: published 상태에서 saveDraft
        const result = await service.saveDraft(
          created.id,
          user.id,
          { title: 'New Draft' },
          SAVE_TYPE.AUTO
        );

        // Then: 새 버전 생성
        expect(result.title).toBe('New Draft');

        const versions =
          await testingRepositoryProvider.PostVersionRepository.find({
            where: { postId: created.id },
            order: { versionNumber: 'ASC' },
          });
        expect(versions).toHaveLength(2);
      });
    });
  });
});

describe('PostService - publishPost (Integration)', () => {
  let app: TestingModule;
  let service: PostService;
  let entityManager: EntityManager;

  const createTestUser = async () => {
    const user = new UserEntity();
    user.email = `test-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@example.com`;
    user.nickname = `user-${Math.random().toString(36).slice(2, 7)}`;
    return testingRepositoryProvider.UserRepository.save(user);
  };

  const createTestBookstore = async (userId: string) => {
    const bookstore = BookstoreEntity.create({
      userId,
      penName: '테스트필명',
      storeName: '테스트서점',
      language: Language.KO,
    });
    return testingRepositoryProvider.BookstoreRepository.save(bookstore);
  };

  beforeAll(async () => {
    await DataSources.readly.initialize();
    app = await getTestingModule();
    service = app.get(PostService);
  });

  afterAll(async () => {
    await app.close();
    await DataSources.readly.destroy();
  });

  beforeEach(async () => {
    entityManager = await getTestingEntityManager();
  });

  afterEach(async () => {
    if (entityManager?.queryRunner?.isTransactionActive) {
      await entityManager.queryRunner.rollbackTransaction();
    }
    if (entityManager?.queryRunner && !entityManager.queryRunner.isReleased) {
      await entityManager.queryRunner.release();
    }
  });

  describe('publishPost', () => {
    it('should update publishedVersionId to latest version id', async () => {
      // Given
      const user = await createTestUser();
      await createTestBookstore(user.id);
      const created = await service.createPost(user.id, {
        title: 'Publish Test',
        freeContent: 'Content',
      });

      // When
      const result = await service.publishPost(created.id, user.id);

      // Then
      expect(result.status).toBe('published');
      expect(result.publishedAt).toBeDefined();

      // publishedVersionId가 latest version의 id와 일치하는지 확인
      const post = await testingRepositoryProvider.PostRepository.findOneBy({
        id: created.id,
      });
      const latestVersion =
        await testingRepositoryProvider.PostVersionRepository.findLatestByPostId(
          created.id
        );
      expect(post!.publishedVersionId).toBe(latestVersion!.id);
    });
  });
});

describe('PostService - getPost (Integration)', () => {
  let app: TestingModule;
  let service: PostService;
  let entityManager: EntityManager;

  const createTestUser = async (
    overrides?: Partial<{ email: string; nickname: string }>
  ) => {
    const user = new UserEntity();
    user.email =
      overrides?.email ??
      `test-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@example.com`;
    user.nickname =
      overrides?.nickname ?? `user-${Math.random().toString(36).slice(2, 7)}`;
    return testingRepositoryProvider.UserRepository.save(user);
  };

  const createTestBookstore = async (userId: string) => {
    const bookstore = BookstoreEntity.create({
      userId,
      penName: '테스트필명',
      storeName: '테스트서점',
      language: Language.KO,
    });
    return testingRepositoryProvider.BookstoreRepository.save(bookstore);
  };

  beforeAll(async () => {
    await DataSources.readly.initialize();
    app = await getTestingModule();
    service = app.get(PostService);
  });

  afterAll(async () => {
    await app.close();
    await DataSources.readly.destroy();
  });

  beforeEach(async () => {
    entityManager = await getTestingEntityManager();
  });

  afterEach(async () => {
    if (entityManager?.queryRunner?.isTransactionActive) {
      await entityManager.queryRunner.rollbackTransaction();
    }
    if (entityManager?.queryRunner && !entityManager.queryRunner.isReleased) {
      await entityManager.queryRunner.release();
    }
  });

  describe('getPost', () => {
    describe('Given: 발행된 포스트에 추가 draft 버전이 있을 때', () => {
      it('should return latest version when author requests', async () => {
        // Given
        const user = await createTestUser();
        await createTestBookstore(user.id);
        const created = await service.createPost(user.id, {
          title: 'Published Title',
          freeContent: 'Published Content',
        });
        await service.publishPost(created.id, user.id);

        // 발행 후 새 draft 저장
        await service.saveDraft(
          created.id,
          user.id,
          { title: 'Draft Title', freeContent: 'Draft Content' },
          SAVE_TYPE.MANUAL
        );

        // When: author가 조회
        const result = await service.getPost(created.id, user.id);

        // Then: latest version (draft) 반환
        expect(result.title).toBe('Draft Title');
        expect(result.freeContent).toBe('Draft Content');
      });

      it('should return published version when reader requests', async () => {
        // Given
        const author = await createTestUser();
        await createTestBookstore(author.id);
        const reader = await createTestUser();

        const created = await service.createPost(author.id, {
          title: 'Published Title',
          freeContent: 'Published Content',
        });
        await service.publishPost(created.id, author.id);

        // 발행 후 새 draft 저장
        await service.saveDraft(
          created.id,
          author.id,
          { title: 'Draft Title', freeContent: 'Draft Content' },
          SAVE_TYPE.MANUAL
        );

        // When: reader가 조회
        const result = await service.getPost(created.id, reader.id);

        // Then: published version 반환
        expect(result.title).toBe('Published Title');
        expect(result.freeContent).toBe('Published Content');
      });
    });
  });
});
