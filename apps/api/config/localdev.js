module.exports = {
  name: '여기는 localdev.js 입니다.',
  database: {
    readly: {
      type: 'postgres',
      host: '127.0.0.1',
      roHost: '127.0.0.1',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'readly',
      migrationsRun: true,
    },
  },

  auth: {
    jwt: {
      backoffice: {
        access: {
          secret: 'JWT_BACKOFFICE_ACCESS_SECRET_DEV',
        },
        refresh: {
          secret: 'JWT_BACKOFFICE_REFRESH_SECRET_DEV',
        }
      },
      user: {
        access: {
          secret: 'JWT_USER_ACCESS_SECRET_DEV',
        },
        refresh: {
          secret: 'JWT_USER_REFRESH_SECRET_DEV',
        }
      }
    }
  },
  cors: {
    origin: true,
  }
};
