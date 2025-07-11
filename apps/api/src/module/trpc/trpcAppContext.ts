import { Injectable } from '@nestjs/common';
import { ContextOptions } from 'nestjs-trpc';

@Injectable()
export class TRPCAppContext {
  async create(opts: ContextOptions) {
    return opts;
  }
}
