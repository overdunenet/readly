import { Inject } from '@nestjs/common';
import { MicroserviceClient } from '@src/module/trpc/microserviceClient';
import { CookieService } from '@src/module/trpc/services/cookie.service';

export class BaseTrpcRouter {
  constructor(
    @Inject(MicroserviceClient)
    protected readonly microserviceClient: MicroserviceClient,
    @Inject(CookieService)
    protected readonly cookieService: CookieService
  ) {}
}
