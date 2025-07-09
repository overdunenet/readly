// in-memory-microservice.strategy.ts
import { CustomTransportStrategy, Server } from '@nestjs/microservices';
import {SharedEventBus} from "@src/module/trpc/eventBus";

export class InMemoryMicroserviceStrategy extends Server implements CustomTransportStrategy {
  private handlers = new Map();
  private eventBus = SharedEventBus.instance;

  listen(callback: () => void) {
    this.eventBus.on('request', async ({ pattern, data, requestId }) => {
      try {
        const handler = this.handlers.get(JSON.stringify(pattern));
        if (handler) {
          const result = await handler(data);
          this.eventBus.respond(requestId, result);
        } else {
          this.eventBus.error(requestId, new Error(`Handler not found for pattern: ${JSON.stringify(pattern)}`));
        }
      } catch (error) {
        this.eventBus.error(requestId, error);
      }
    });
    callback();
  }

  close() {
    this.eventBus.removeAllListeners();
  }

  // MessageHandler 등록 (NestJS가 자동으로 호출)
  addHandler(pattern: any, callback: (...args: any[]) => any) {
    const key = JSON.stringify(pattern);
    this.handlers.set(key, callback);
    console.log(`Registered handler for pattern: ${key}`);
  }

  // 이벤트 리스너 등록
  on<EventKey, EventCallback>(event: EventKey, callback: EventCallback): any {
    if (typeof event === 'string') {
      this.eventBus.on(event, callback as any);
    }
    return this;
  }

  // 래핑된 객체 반환 (일반적으로 EventBus 인스턴스 자체를 반환)
  unwrap<T>(): T {
    return this.eventBus as T;
  }

  // 추가: off 메서드도 구현하면 좋습니다
  off<EventKey, EventCallback>(event: EventKey, callback?: EventCallback): any {
    if (typeof event === 'string') {
      if (callback) {
        this.eventBus.off(event, callback as any);
      } else {
        this.eventBus.removeAllListeners(event);
      }
    }
    return this;
  }
}