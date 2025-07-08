import { Input, Query, Router } from 'nestjs-trpc';
import { z } from 'zod';
import {BaseTrpcRouter} from "@src/module/trpc/baseTrpcRouter";

@Router({ alias: 'sample' })
export class SampleRouter extends BaseTrpcRouter {

  @Query({
    input: z.object({
      name: z.string().optional(),
    }),
    output: z.string(),
  })
  getHello(@Input('name') name?: string): Promise<string> {
    return this.microserviceClient.send('sample.getHello', name);
  }

  @Query({
    output: z.string(),
  })
  async getSample() {
    return this.microserviceClient.send('sample.getSample', {});
  }
}
