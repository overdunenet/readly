import { EntityManager } from 'typeorm';
import { DataSources } from '@src/database/datasources';

export class TransactionService {
  private transaction: EntityManager | undefined;

  get isTransactionActive(): boolean {
    return !!this.transaction?.queryRunner?.isTransactionActive;
  }

  // transaction이 시작될 때 start로 entityManager 등록 필요
  startTransaction(transaction: EntityManager): void {
    // 기존 진핸중인 transaction이 없을 경우에만 transaction 활성화
    if (!this.isTransactionActive) {
      this.transaction = transaction;
    }
  }

  runInTransaction<T>(
    run: (transaction: EntityManager) => Promise<T>
  ): Promise<T> {
    if (this.isTransactionActive) {
      return run(this.transaction as EntityManager);
    }
    return DataSources.readly.transaction(async manager => {
      this.startTransaction(manager);
      return run(this.transaction as EntityManager);
    });
  }

  releaseTransaction(): void {
    this.transaction = undefined;
  }

  getTransaction(): EntityManager | undefined {
    // Transaction 만료시 release
    if (this.transaction && !this.isTransactionActive) {
      this.releaseTransaction();
    }
    return this.transaction;
  }
}
