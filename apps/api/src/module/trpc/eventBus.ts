import { EventEmitter } from 'events';

export class SharedEventBus extends EventEmitter {
  static instance = new SharedEventBus();

  async call(pattern: string, data: any): Promise<any> {
    const result: any = await new Promise((resolve, reject) => {
      const requestId = Math.random().toString(36);

      // 응답 리스너 등록
      this.once(`response:${requestId}`, resolve);
      this.once(`error:${requestId}`, reject);

      // 요청 발송
      this.emit('request', { pattern, data, requestId });

      // 타임아웃 설정
      setTimeout(() => reject(new Error('Request timeout')), 5000);
    });
    return result;
  }

  respond(requestId: string, data: any) {
    this.emit(`response:${requestId}`, data);
  }

  error(requestId: string, error: any) {
    this.emit(`error:${requestId}`, error);
  }
}
