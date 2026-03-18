import {
  Catch,
  RpcExceptionFilter,
  ArgumentsHost,
  Logger,
  HttpException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';

@Catch()
export class MicroserviceExceptionFilter implements RpcExceptionFilter<any> {
  private readonly logger = new Logger('Microservice');

  catch(exception: any, host: ArgumentsHost): Observable<any> {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      if (status >= 500) {
        this.logger.error(exception.message, exception.stack);
      } else {
        this.logger.warn(`${status}: ${exception.message}`);
      }
    } else if (exception instanceof Error) {
      this.logger.error(exception.message, exception.stack);
    } else {
      this.logger.error(`Unknown error: ${String(exception)}`);
    }

    return throwError(() => exception);
  }
}
