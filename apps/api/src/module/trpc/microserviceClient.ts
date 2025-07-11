import { Injectable } from '@nestjs/common';
import { SharedEventBus } from '@src/module/trpc/eventBus';
import { transformToTRPCError } from '@src/utils/trpc-error-transformer';

@Injectable()
export class MicroserviceClient {
  async send(pattern: string, data?: any): Promise<any> {
    try {
      return await SharedEventBus.instance.call(pattern, data);
    } catch (error) {
      // Transform any error from NestJS services to TRPCError
      throw transformToTRPCError(error);
    }
  }
}
