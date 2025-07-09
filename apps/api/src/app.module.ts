import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedModule } from '@src/module/shared/shared.module';
import { SampleModule } from '@src/module/sample/sample.module';

@Module({
  imports: [
    SharedModule,
    SampleModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
