import { Global, Module } from '@nestjs/common';
import { TRPCModule } from 'nestjs-trpc';
import { MicroserviceClient } from '@src/module/trpc/microserviceClient';
import { AutoRouterModule } from '@src/module/trpc/routerModule';
import { TRPCAppContext } from '@src/module/trpc/trpcAppContext';
import { AppController } from '@src/app.controller';
import { CookieService } from '@src/module/trpc/services/cookie.service';

@Global()
@Module({
  controllers: [AppController],
  providers: [MicroserviceClient, CookieService],
  exports: [MicroserviceClient, CookieService],
})
class TrpcModuleExport {}

@Module({
  imports: [
    TrpcModuleExport,
    TRPCModule.forRoot({
      autoSchemaFile: '../../packages/api-types/src',
      context: TRPCAppContext,
    }),
    AutoRouterModule.forRoot({
      basePath: __dirname,
      pattern: './**/*.{router,middleware}.{ts,js}',
    }),
  ],
  providers: [TRPCAppContext],
})
export class TrpcModule {}
