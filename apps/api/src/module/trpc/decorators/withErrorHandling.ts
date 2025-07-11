import { UseMiddlewares } from 'nestjs-trpc';
import { ErrorHandlingMiddleware } from '../errorHandling.middleware';

/**
 * Decorator that applies error handling middleware along with other middlewares
 * @param middlewares Additional middlewares to apply
 */
export function WithErrorHandling(...middlewares: any[]) {
  return UseMiddlewares(ErrorHandlingMiddleware, ...middlewares);
}
