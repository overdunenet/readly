module.exports = {
  name: '여기는 test.js 입니다.',
  database: {
    readly: {
      type: 'postgres',
      host: '127.0.0.1',
      roHost: '127.0.0.1',
      port: 55432,
      username: 'postgres',
      password: 'postgres',
      database: 'readly_test',
      entities: ['src/module/**/*.entity.ts'],
      migrations: ['src/database/migration/*.ts'],
      migrationsRun: false,
      ssl: false,
    },
  },
  auth: {
    jwt: {
      backoffice: {
        access: { secret: 'TEST_BACKOFFICE_ACCESS', expiresIn: '1h' },
        refresh: { secret: 'TEST_BACKOFFICE_REFRESH', expiresIn: '30d' },
      },
      user: {
        access: { secret: 'TEST_USER_ACCESS', expiresIn: '1h' },
        refresh: { secret: 'TEST_USER_REFRESH', expiresIn: '7d' },
      },
    },
  },
  cors: { origin: true },
};
