import { ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { MicroserviceExceptionFilter } from './microservice-exception.filter';

describe('MicroserviceExceptionFilter', () => {
  let filter: MicroserviceExceptionFilter;
  let loggerErrorSpy: jest.SpyInstance;
  let loggerWarnSpy: jest.SpyInstance;
  const mockHost = {} as ArgumentsHost;

  beforeEach(() => {
    filter = new MicroserviceExceptionFilter();
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
    loggerWarnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('HttpException (5xx)', () => {
    it('logger.error를 호출한다', () => {
      const exception = new HttpException('Internal Server Error', 500);

      filter.catch(exception, mockHost);

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        exception.message,
        exception.stack
      );
    });

    it('throwError로 원래 exception을 재전파한다', async () => {
      const exception = new HttpException('Internal Server Error', 500);

      const result = filter.catch(exception, mockHost);

      await expect(firstValueFrom(result)).rejects.toBe(exception);
    });
  });

  describe('HttpException (4xx)', () => {
    it('logger.warn을 호출한다', () => {
      const exception = new HttpException('Not Found', 404);

      filter.catch(exception, mockHost);

      expect(loggerWarnSpy).toHaveBeenCalledWith(`404: ${exception.message}`);
    });

    it('throwError로 원래 exception을 재전파한다', async () => {
      const exception = new HttpException('Not Found', 404);

      const result = filter.catch(exception, mockHost);

      await expect(firstValueFrom(result)).rejects.toBe(exception);
    });
  });

  describe('일반 Error', () => {
    it('logger.error를 호출한다', () => {
      const exception = new Error('something went wrong');

      filter.catch(exception, mockHost);

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        exception.message,
        exception.stack
      );
    });

    it('throwError로 원래 exception을 재전파한다', async () => {
      const exception = new Error('something went wrong');

      const result = filter.catch(exception, mockHost);

      await expect(firstValueFrom(result)).rejects.toBe(exception);
    });
  });

  describe('알 수 없는 에러 (string 등)', () => {
    it('logger.error를 호출한다', () => {
      const exception = 'unexpected string error';

      filter.catch(exception, mockHost);

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        `Unknown error: ${String(exception)}`
      );
    });

    it('throwError로 원래 exception을 재전파한다', async () => {
      const exception = 'unexpected string error';

      const result = filter.catch(exception, mockHost);

      await expect(firstValueFrom(result)).rejects.toBe(exception);
    });
  });
});
