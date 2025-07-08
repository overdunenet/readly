import { ConfigProvider } from './src/config';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

const getDataSource = async () =>
  new DataSource({
    migrationsTableName: 'migrations',
    ...ConfigProvider.database.readly,
    name: 'default',
    migrationsRun: false,
    namingStrategy: new SnakeNamingStrategy(),
    synchronize: false,
    entities: ['src/module/**/*.entity.ts'],
    migrations: ['src/database/migration/*.ts'],
  });

export const connectionSource = getDataSource();
