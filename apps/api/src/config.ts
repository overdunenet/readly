import * as dotenv from 'dotenv';
// 순서 중요!! - dotenv.config는 config보다 먼저 호출 되어야 함
dotenv.config();
import config from 'config';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

type JwtConfigType = {
  secret: string;
  expiresIn: string;
}

type AppJwtConfigType = {
  access: JwtConfigType;
  refresh: JwtConfigType;
}

type CorsConfigType = {
  origin: boolean | string | string[];
  credentials: boolean;
  methods?: string[];
  allowedHeaders?: string[];
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const ConfigProvider = {
  stage: config.get<string>('stage'),
  database: {
    readly: {
      ...config.get<PostgresConnectionOptions & { roHost: string }>(
        'database.readly'
      ),
      logger: 'debug',
      logging: true,
      synchronize: false,
    },
  },
  auth: {
    jwt: {
      backoffice: config.get<AppJwtConfigType>('auth.jwt.backoffice'),
      user: config.get<AppJwtConfigType>('auth.jwt.user'),
    }
  },
  cors: config.get<CorsConfigType>('cors')
} as const;
