module.exports = {
  stage: process.env.NODE_ENV,
  name: '여기는 default.js 입니다.',
  database: {
    readly: {
      type: 'postgres',
      host: process.env.POSTGRES_DB_HOST,
      roHost: process.env.POSTGRES_DB_HOST_RO || process.env.POSTGRES_DB_HOST,
      port: 5432,
      username: process.env.POSTGRES_DB_USERNAME,
      password: process.env.POSTGRES_DB_PASSWORD,
      database: process.env.POSTGRES_DB_NAME,
      migrationsRun: false,
      entities: ['dist/src/module/**/*.entity.js'],
      migrations: ['dist/src/database/migration/*.js'],
    },
  },
  auth: {
    jwt: {
      backoffice: {
        access: {
          secret: process.env.JWT_BACKOFFICE_ACCESS_SECRET,
          expiresIn: '1h',
        },
        refresh: {
          secret: process.env.JWT_BACKOFFICE_REFRESH_SECRET,
          expiresIn: '30d',
        }
      },
      store: {
        access: {
          secret: process.env.JWT_STORE_ACCESS_SECRET,
          expiresIn: '1h',
        },
        refresh: {
          secret: process.env.JWT_STORE_REFRESH_SECRET,
          expiresIn: '7d',
        }
      },
      influencer: {
        access: {
          secret: process.env.JWT_INFLUENCER_ACCESS_SECRET,
          expiresIn: '1h',
        },
        refresh: {
          secret: process.env.JWT_INFLUENCER_REFRESH_SECRET,
          expiresIn: '7d',
        }
      }
    }
  },
  cors: {
    origin: [
      // TODO: 프로덕션 도메인들 (실제 배포 시 수정 필요)
    ],
    credentials: true,
  }
};
