import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { In } from 'typeorm';
import { RepositoryProvider } from '../shared/transaction/repository.provider';
import { PostEntity, PostAccessLevel } from '../domain/post.entity';
import {
  PostVersionEntity,
  SaveType,
  SAVE_TYPE,
} from '../domain/post-version.entity';

export interface CreatePostInput {
  title?: string;
  freeContent?: string;
  paidContent?: string | null;
  excerpt?: string | null;
  thumbnail?: string | null;
  accessLevel?: PostAccessLevel;
  price?: number;
}

export interface UpdatePostInput {
  title?: string;
  freeContent?: string;
  paidContent?: string | null;
  excerpt?: string | null;
  thumbnail?: string | null;
  accessLevel?: PostAccessLevel;
  price?: number;
}

export interface SaveDraftInput {
  title?: string;
  freeContent?: string;
  paidContent?: string | null;
  excerpt?: string | null;
  thumbnail?: string | null;
}

export interface SchedulePostInput {
  scheduledAt: Date;
}

export interface FlattenedPost {
  id: string;
  title: string;
  freeContent: string;
  paidContent: string | null;
  excerpt: string | null;
  thumbnail: string | null;
  accessLevel: PostAccessLevel;
  status: string;
  price: number;
  bookstoreId: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  author?: {
    id: string;
    nickname: string;
    profileImage: string | null;
  };
}

@Injectable()
export class PostService {
  constructor(private readonly repositoryProvider: RepositoryProvider) {}

  private flattenPostWithVersion(
    post: PostEntity,
    version: PostVersionEntity
  ): FlattenedPost {
    return {
      id: post.id,
      title: version.title,
      freeContent: version.freeContent,
      paidContent: version.paidContent,
      excerpt: version.excerpt,
      thumbnail: version.thumbnail,
      accessLevel: post.accessLevel,
      status: post.status,
      price: post.price,
      bookstoreId: post.bookstoreId,
      publishedAt: post.publishedAt,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      ...(post.author && {
        author: {
          id: post.author.id,
          nickname: post.author.nickname,
          profileImage: post.author.profileImage,
        },
      }),
    };
  }

  async createPost(authorId: string, input: CreatePostInput) {
    const bookstore =
      await this.repositoryProvider.BookstoreRepository.findOneBy({
        userId: authorId,
      });

    if (!bookstore) {
      throw new ForbiddenException('서점을 먼저 오픈해주세요');
    }

    const post = await this.repositoryProvider.PostRepository.createPost({
      authorId,
      bookstoreId: bookstore.id,
      accessLevel: input.accessLevel,
      price: input.price,
    });

    const version = PostVersionEntity.createInitial(post.id, {
      title: input.title,
      freeContent: input.freeContent,
      paidContent: input.paidContent,
      excerpt: input.excerpt,
      thumbnail: input.thumbnail,
    });
    const savedVersion =
      await this.repositoryProvider.PostVersionRepository.save(version);

    return this.flattenPostWithVersion(post, savedVersion);
  }

  async saveDraft(
    postId: string,
    authorId: string,
    input: SaveDraftInput,
    saveType: SaveType
  ) {
    const post =
      await this.repositoryProvider.PostRepository.findOneByIdForEdit(
        postId,
        authorId
      ).catch(() => {
        throw new ForbiddenException(
          'Post not found or you are not allowed to edit this post'
        );
      });

    const latest =
      await this.repositoryProvider.PostVersionRepository.findLatestByPostId(
        postId
      );

    if (!latest) {
      throw new NotFoundException('No version found for this post');
    }

    // 최신 버전이 auto이고 발행된 버전이 아닌 경우 덮어쓰기
    if (
      latest.saveType === SAVE_TYPE.AUTO &&
      latest.id !== post.publishedVersionId
    ) {
      latest.editContent(input);
      latest.saveType = saveType;
      const savedVersion =
        await this.repositoryProvider.PostVersionRepository.save(latest);
      return this.flattenPostWithVersion(post, savedVersion);
    }

    // manual 또는 published 버전인 경우 새 버전 생성
    const mergedInput = {
      title: input.title ?? latest.title,
      freeContent: input.freeContent ?? latest.freeContent,
      paidContent:
        input.paidContent !== undefined
          ? input.paidContent
          : latest.paidContent,
      excerpt: input.excerpt !== undefined ? input.excerpt : latest.excerpt,
      thumbnail:
        input.thumbnail !== undefined ? input.thumbnail : latest.thumbnail,
    };

    const version = PostVersionEntity.createNext(
      postId,
      latest.versionNumber + 1,
      saveType,
      mergedInput
    );
    const savedVersion =
      await this.repositoryProvider.PostVersionRepository.save(version);

    return this.flattenPostWithVersion(post, savedVersion);
  }

  async updatePost(postId: string, authorId: string, input: UpdatePostInput) {
    const post =
      await this.repositoryProvider.PostRepository.findOneByIdForEdit(
        postId,
        authorId
      ).catch(() => {
        throw new ForbiddenException(
          'Post not found or you are not allowed to update this post'
        );
      });

    // 메타데이터 업데이트
    post.edit({ accessLevel: input.accessLevel, price: input.price });
    await this.repositoryProvider.PostRepository.save(post);

    // 콘텐츠 변경이 있으면 saveDraft로 버전 저장
    const hasContentChanges = [
      input.title,
      input.freeContent,
      input.paidContent,
      input.excerpt,
      input.thumbnail,
    ].some(v => v !== undefined);

    if (hasContentChanges) {
      return this.saveDraft(
        postId,
        authorId,
        {
          title: input.title,
          freeContent: input.freeContent,
          paidContent: input.paidContent,
          excerpt: input.excerpt,
          thumbnail: input.thumbnail,
        },
        SAVE_TYPE.MANUAL
      );
    }

    // 메타데이터만 변경된 경우 latest version과 합성하여 반환
    const latest =
      await this.repositoryProvider.PostVersionRepository.findLatestByPostId(
        postId
      );
    if (!latest) {
      throw new NotFoundException('No version found for this post');
    }
    return this.flattenPostWithVersion(post, latest);
  }

  async publishPost(postId: string, authorId: string) {
    const post =
      await this.repositoryProvider.PostRepository.findOneByIdForEdit(
        postId,
        authorId
      ).catch(() => {
        throw new ForbiddenException(
          'Post not found or you are not allowed to publish this post'
        );
      });

    const latest =
      await this.repositoryProvider.PostVersionRepository.findLatestByPostId(
        postId
      );

    if (!latest) {
      throw new NotFoundException('No version found for this post');
    }

    post.publish(latest.id);
    await this.repositoryProvider.PostRepository.save(post);

    return this.flattenPostWithVersion(post, latest);
  }

  async unpublishPost(postId: string, authorId: string) {
    const post =
      await this.repositoryProvider.PostRepository.findOneByIdForEdit(
        postId,
        authorId
      ).catch(() => {
        throw new ForbiddenException(
          'Post not found or you are not allowed to unpublish this post'
        );
      });

    post.unpublish();
    await this.repositoryProvider.PostRepository.save(post);

    const latest =
      await this.repositoryProvider.PostVersionRepository.findLatestByPostId(
        postId
      );

    if (!latest) {
      throw new NotFoundException('No version found for this post');
    }

    return this.flattenPostWithVersion(post, latest);
  }

  async deletePost(postId: string, authorId: string): Promise<void> {
    const post =
      await this.repositoryProvider.PostRepository.findOneByIdForEdit(
        postId,
        authorId
      ).catch(() => {
        throw new ForbiddenException(
          'Post not found or you are not allowed to delete this post'
        );
      });

    await this.repositoryProvider.PostRepository.softRemove(post);
  }

  async getPost(postId: string, userId?: string) {
    const post =
      await this.repositoryProvider.PostRepository.findOneByIdForRead(
        postId,
        userId
      ).catch(() => {
        throw new NotFoundException(
          'Post not found or you are not allowed to read this post'
        );
      });

    const isAuthor = userId != null && userId === post.authorId;

    const version = isAuthor
      ? await this.repositoryProvider.PostVersionRepository.findLatestByPostId(
          postId
        )
      : await this.repositoryProvider.PostVersionRepository.findOne({
          where: { id: post.publishedVersionId! },
        });

    if (!version) {
      throw new NotFoundException('No version found for this post');
    }

    // 유료 본문 접근 권한이 없으면 paidContent를 null로 마스킹
    if (!post.canAccessPaidContent(userId ?? null)) {
      version.paidContent = null;
    }

    return this.flattenPostWithVersion(post, version);
  }

  async getMyPosts(authorId: string) {
    const posts = await this.repositoryProvider.PostRepository.find({
      where: { authorId },
      relations: ['author'],
      order: { createdAt: 'DESC' },
    });

    if (posts.length === 0) {
      return [];
    }

    const postIds = posts.map(p => p.id);

    // 서브쿼리로 각 post의 최신 버전 ID를 구한 후 한 번에 조회
    const latestVersionRows =
      await this.repositoryProvider.PostVersionRepository.createQueryBuilder(
        'pv'
      )
        .select('DISTINCT ON (pv.post_id) pv.id', 'id')
        .where('pv.post_id IN (:...postIds)', { postIds })
        .orderBy('pv.post_id')
        .addOrderBy('pv.version_number', 'DESC')
        .getRawMany<{ id: string }>();

    const latestVersionIds = latestVersionRows.map(r => r.id);

    const versions =
      latestVersionIds.length > 0
        ? await this.repositoryProvider.PostVersionRepository.find({
            where: { id: In(latestVersionIds) },
          })
        : [];

    const versionMap = new Map(versions.map(v => [v.postId, v]));

    return posts
      .filter(post => versionMap.has(post.id))
      .map(post => this.flattenPostWithVersion(post, versionMap.get(post.id)!));
  }

  async getAccessiblePosts() {
    const posts = await this.repositoryProvider.PostRepository.find({
      where: { status: 'published', accessLevel: 'public' },
      relations: ['author'],
      order: { publishedAt: 'DESC' },
    });

    if (posts.length === 0) {
      return [];
    }

    const publishedVersionIds = posts
      .map(p => p.publishedVersionId)
      .filter((id): id is string => id != null);

    const versions = await this.repositoryProvider.PostVersionRepository.find({
      where: { id: In(publishedVersionIds) },
    });

    const versionMap = new Map(versions.map(v => [v.id, v]));

    return posts
      .filter(
        post =>
          post.publishedVersionId != null &&
          versionMap.has(post.publishedVersionId)
      )
      .map(post =>
        this.flattenPostWithVersion(
          post,
          versionMap.get(post.publishedVersionId!)!
        )
      );
  }
}
