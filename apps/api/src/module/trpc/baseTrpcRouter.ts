import {Inject} from "@nestjs/common";
import {MicroserviceClient} from "@src/module/trpc/microserviceClient";


export class BaseTrpcRouter {

  constructor(
    @Inject(MicroserviceClient) protected readonly microserviceClient: MicroserviceClient
  ) {}
}