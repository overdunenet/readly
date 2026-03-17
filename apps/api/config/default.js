module.exports = {
  stage: process.env.NODE_ENV,
  name: '여기는 default.js 입니다.',
  database: {
    readly: {
      type: 'postgres',
      host: process.env.DB_POSTGRES_HOST,
      roHost: process.env.DB_POSTGRES_RO_HOST || process.env.DB_POSTGRES_HOST,
      port: 5432,
      username: process.env.DB_POSTGRES_USERNAME,
      password: process.env.DB_POSTGRES_PASSWORD,
      database: 'readly',
      ssl: { rejectUnauthorized: false },
      migrationsRun: true,
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
      user: {
        access: {
          secret: process.env.JWT_USER_ACCESS_SECRET,
          expiresIn: '1h',
        },
        refresh: {
          secret: process.env.JWT_USER_REFRESH_SECRET,
          expiresIn: '7d',
        }
      }
    },
    naver: {
      clientId: process.env.NAVER_CLIENT_ID,
      clientSecret: process.env.NAVER_CLIENT_SECRET,
      callbackUrl: process.env.NAVER_CALLBACK_URL,
    },
    kakao: {
      clientId: process.env.KAKAO_CLIENT_ID,
      clientSecret: process.env.KAKAO_CLIENT_SECRET,
      callbackUrl: 'https://readly.co.kr/auth/kakao/callback',
    },
  },
  cors: {
    origin: [
      /\.readly\.co\.kr$/,
    ],
    credentials: true,
  }
};
