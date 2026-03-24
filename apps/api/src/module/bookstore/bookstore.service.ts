import {
  Injectable,
  ForbiddenException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { RepositoryProvider } from '../shared/transaction/repository.provider';
import { BookstoreEntity } from '../domain/bookstore.entity';

export interface OpenBookstoreInput {
  penName: string;
  storeName: string;
  termsAgreedAt?: Date;
}

@Injectable()
export class BookstoreService {
  constructor(private readonly repositoryProvider: RepositoryProvider) {}

  async open(
    userId: string,
    input: OpenBookstoreInput
  ): Promise<BookstoreEntity> {
    const existing =
      await this.repositoryProvider.BookstoreRepository.findOneBy({ userId });

    if (existing) {
      throw new ConflictException('이미 서점을 보유하고 있습니다');
    }

    const user = await this.repositoryProvider.UserRepository.findOneByOrFail({
      id: userId,
    }).catch(() => {
      throw new NotFoundException('사용자를 찾을 수 없습니다');
    });

    if (user.country !== 'KR') {
      throw new ForbiddenException(
        '현재 한국 유저만 서점을 오픈할 수 있습니다'
      );
    }

    const bookstore = BookstoreEntity.create({
      userId,
      penName: input.penName,
      storeName: input.storeName,
      country: user.country,
      termsAgreedAt: input.termsAgreedAt,
    });
    bookstore.openedAt = new Date();

    return this.repositoryProvider.BookstoreRepository.save(bookstore);
  }

  async hasBookstore(userId: string): Promise<boolean> {
    const bookstore =
      await this.repositoryProvider.BookstoreRepository.findOneBy({ userId });
    return !!bookstore;
  }

  async getMyBookstore(userId: string): Promise<BookstoreEntity> {
    return this.repositoryProvider.BookstoreRepository.findOneByOrFail({
      userId,
    }).catch(() => {
      throw new NotFoundException('서점을 찾을 수 없습니다');
    });
  }
}
