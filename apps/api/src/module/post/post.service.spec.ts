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
import { PostAccessLevel } from '../domain/post.entity';
import { BookstoreEntity } from '../domain/bookstore.entity';

describe('PostService - getAccessiblePosts', () => {
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
      country: 'KR',
    });
    return testingRepositoryProvider.BookstoreRepository.save(bookstore);
  };

  const createTestPost = async (
    authorId: string,
    overrides?: Partial<{
      title: string;
      content: string;
      accessLevel: PostAccessLevel;
      publish: boolean;
    }>
  ) => {
    const post = await service.createPost(authorId, {
      title: overrides?.title ?? '테스트 포스트',
      content: overrides?.content ?? '테스트 내용입니다.',
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
    // 약간의 시간차를 위해 publishedAt을 직접 설정
    await createTestPost(user.id, { title: '나중에 작성' });

    const result = await service.getAccessiblePosts();

    expect(result.length).toBeGreaterThanOrEqual(2);
    // 최신 포스트가 먼저
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
