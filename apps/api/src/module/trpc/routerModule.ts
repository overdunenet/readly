// auto-router.module.ts
import { DynamicModule, Module } from '@nestjs/common';
import * as path from 'path';
import {ModuleLoader} from "@src/module/trpc/moduleLoader";

@Module({})
export class AutoRouterModule {
  static async forRoot(options?: {
    basePath?: string;
    pattern?: string;
  }): Promise<DynamicModule> {
    const basePath = options?.basePath || path.join(__dirname, '../');
    const pattern = options?.pattern || '**/*.router.{ts,js}';

    const routers = await ModuleLoader.loadRouters(basePath, pattern);

    console.log('Auto-loaded routers:', routers.map(r => r.name));

    return {
      module: AutoRouterModule,
      providers: routers,
      exports: routers,
    };
  }
}