import { REQUEST } from '@nestjs/core';
import { Global, Module, Scope } from '@nestjs/common';
import { RequestService } from './request.service';

@Global()
@Module({
  providers: [
    {
      provide: RequestService,
      useFactory: req => new RequestService(req),
      inject: [REQUEST],
      scope: Scope.REQUEST,
    },
  ],
  exports: [RequestService],
})
export class RequestModule {}
