import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { NicepayClientService } from './nicepay-client.service';

@Module({
  imports: [HttpModule],
  providers: [NicepayClientService],
  exports: [NicepayClientService],
})
export class NicepayClientModule {}
