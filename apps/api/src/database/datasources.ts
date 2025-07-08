import { ConfigProvider } from '@src/config';
import {DataSource, EntityManager} from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import {TransactionService} from "@src/module/shared/transaction/transaction.service";

export class DataSources {
  private static readlyInstance: DataSource;

  static get readly(): DataSource {
    if (!this.readlyInstance) {
      const connectionOptions: PostgresConnectionOptions = {
        ...ConfigProvider.database.readly,
      };
      const readOnlyConnectionOptions: PostgresConnectionOptions = {
        ...connectionOptions,
        host: ConfigProvider.database.readly.roHost,
      };

      this.readlyInstance = new DataSource({
        ...connectionOptions,
        replication: {
          master: connectionOptions,
          slaves: [readOnlyConnectionOptions],
        },
        name: 'readly',
        namingStrategy: new SnakeNamingStrategy(),
        synchronize: false,
      });
    }
    return this.readlyInstance;
  }
}



export function getEntityManager(source?: EntityManager | TransactionService | DataSource): EntityManager | DataSource {
  if (source instanceof TransactionService) {
    return source.getTransaction() ?? DataSources.readly;
  }
  return source ?? DataSources.readly;
}