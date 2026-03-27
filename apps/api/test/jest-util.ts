import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '@src/app.module';
import { DataSources } from '@src/database/datasources';
import { getUserRepository } from '@src/module/domain/user.entity';
import { getPostRepository } from '@src/module/domain/post.entity';
import { getCashRepository } from '@src/module/domain/cash.entity';
import { getCashBalanceRepository } from '@src/module/domain/cash-balance.entity';
import { getCashHistoryRepository } from '@src/module/domain/cash-history.entity';
import { getBookstoreRepository } from '@src/module/domain/bookstore.entity';
import { RepositoryProvider } from '@src/module/shared/transaction/repository.provider';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { EntityManager } from 'typeorm';

const testingTransactionService = new TransactionService();
export const testingRepositoryProvider = new RepositoryProvider(
  testingTransactionService
);

export async function getTestingModule(): Promise<TestingModule> {
  const app: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(TransactionService)
    .useValue(testingTransactionService)
    .overrideProvider(RepositoryProvider)
    .useValue(testingRepositoryProvider)
    .compile();

  return app;
}

export const mockJestRepository = (entityManager?: EntityManager) => {
  const mockedRepository = {
    UserRepository: getUserRepository(entityManager),
    PostRepository: getPostRepository(entityManager),
    CashRepository: getCashRepository(entityManager),
    CashBalanceRepository: getCashBalanceRepository(entityManager),
    CashHistoryRepository: getCashHistoryRepository(entityManager),
    BookstoreRepository: getBookstoreRepository(entityManager),
  };

  Object.entries(mockedRepository).forEach(([key, repo]) => {
    jest
      .spyOn(testingRepositoryProvider, key as keyof RepositoryProvider, 'get')
      .mockImplementation(() => repo);
  });
};

export const getTestingEntityManager = async (): Promise<EntityManager> => {
  const queryRunner = DataSources.readly.createQueryRunner();
  await queryRunner.startTransaction();
  const manager = DataSources.readly.createEntityManager(queryRunner);
  testingTransactionService.startTransaction(manager);
  mockJestRepository(manager);
  return manager;
};
