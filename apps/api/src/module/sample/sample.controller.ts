import {MessagePattern} from "@nestjs/microservices";
import {SampleService} from "@src/module/sample/sample.service";
import {Controller} from "@nestjs/common";


@Controller()
export class SampleController {
  constructor(
    private readonly sampleService: SampleService,
  ) {}

  @MessagePattern('sample.getHello')
  getHello(name?: string): string {
    return this.sampleService.getHello() + name;
  }

  @MessagePattern('sample.getSample')
  getSample(): string {
    return this.sampleService.getSample();
  }
}