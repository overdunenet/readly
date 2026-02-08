import { Injectable } from '@nestjs/common';
import { ContextOptions, TRPCContext } from 'nestjs-trpc-v2';

@Injectable()
export class TRPCAppContext implements TRPCContext {
  async create(opts: ContextOptions) {
    return opts;
  }
}
