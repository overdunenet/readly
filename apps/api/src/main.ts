import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSources } from '@src/database/datasources';
import { TrpcModule } from '@src/trpc.module';
import { MicroserviceOptions } from '@nestjs/microservices';
import { InMemoryMicroserviceStrategy } from '@src/module/trpc/inmemoryMicroserviceStrategy';
import { ConfigProvider } from '@src/config';
import cookieParser from 'cookie-parser';
import { MicroserviceExceptionFilter } from '@src/filters/microservice-exception.filter';

async function bootstrap() {
  await DataSources.readly.initialize();
  // App Microservice
  const microservice =
    await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
      strategy: new InMemoryMicroserviceStrategy(),
    });

  // Add GlobalExceptionFilter to microservice
  microservice.useGlobalFilters(new MicroserviceExceptionFilter());

  await microservice.listen();
  const trpcApp = await NestFactory.create(TrpcModule);

  trpcApp.use(cookieParser());
  trpcApp.enableCors(ConfigProvider.cors);

  await trpcApp.listen(3000);
}
bootstrap();
