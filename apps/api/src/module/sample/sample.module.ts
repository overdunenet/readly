import { Module } from '@nestjs/common';
import { SampleService } from '@src/module/sample/sample.service';
import {SampleController} from "@src/module/sample/sample.controller";

@Module({
  imports: [],
  controllers: [SampleController],
  providers: [SampleService],
  exports: [SampleService],
})
export class SampleModule {}
