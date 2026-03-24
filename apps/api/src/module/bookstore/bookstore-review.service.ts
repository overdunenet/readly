import {
  Injectable,
  ForbiddenException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { RepositoryProvider } from '../shared/transaction/repository.provider';
import { BookstoreReviewEntity } from '../domain/bookstore-review.entity';

@Injectable()
export class BookstoreReviewService {
  constructor(private readonly repositoryProvider: RepositoryProvider) {}

  async create(
    reviewerId: string,
    bookstoreId: string,
    content: string
  ): Promise<BookstoreReviewEntity> {
    // 자기 서점에 리뷰 불가
    const bookstore =
      await this.repositoryProvider.BookstoreRepository.findOneByOrFail({
        id: bookstoreId,
      }).catch(() => {
        throw new NotFoundException('서점을 찾을 수 없습니다');
      });

    if (bookstore.userId === reviewerId) {
      throw new ForbiddenException('자신의 서점에는 리뷰를 작성할 수 없습니다');
    }

    // 중복 리뷰 체크 (soft delete 포함하지 않으므로 deletedAt IS NULL 조건 자동 적용)
    const existing =
      await this.repositoryProvider.BookstoreReviewRepository.findOneBy({
        bookstoreId,
        reviewerId,
      });

    if (existing) {
      throw new ConflictException('이미 이 서점에 리뷰를 작성했습니다');
    }

    const review = BookstoreReviewEntity.create({
      bookstoreId,
      reviewerId,
      content,
    });

    return this.repositoryProvider.BookstoreReviewRepository.save(review);
  }

  async update(
    reviewerId: string,
    reviewId: string,
    content: string
  ): Promise<BookstoreReviewEntity> {
    const review =
      await this.repositoryProvider.BookstoreReviewRepository.findOneByOrFail({
        id: reviewId,
      }).catch(() => {
        throw new NotFoundException('리뷰를 찾을 수 없습니다');
      });

    if (!review.isOwnedBy(reviewerId)) {
      throw new ForbiddenException('본인의 리뷰만 수정할 수 있습니다');
    }

    review.content = content;

    return this.repositoryProvider.BookstoreReviewRepository.save(review);
  }

  async delete(reviewerId: string, reviewId: string): Promise<void> {
    const review =
      await this.repositoryProvider.BookstoreReviewRepository.findOneByOrFail({
        id: reviewId,
      }).catch(() => {
        throw new NotFoundException('리뷰를 찾을 수 없습니다');
      });

    if (!review.isOwnedBy(reviewerId)) {
      throw new ForbiddenException('본인의 리뷰만 삭제할 수 있습니다');
    }

    await this.repositoryProvider.BookstoreReviewRepository.softRemove(review);
  }

  async getByBookstore(
    bookstoreId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ reviews: BookstoreReviewEntity[]; total: number }> {
    const skip = (page - 1) * limit;

    const [reviews, total] =
      await this.repositoryProvider.BookstoreReviewRepository.findAndCount({
        where: { bookstoreId },
        relations: ['reviewer'],
        order: { createdAt: 'DESC' },
        skip,
        take: limit,
      });

    return { reviews, total };
  }
}
