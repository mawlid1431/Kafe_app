import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Wire-format normaliser.
 *
 * The React Native app and the admin dashboard expect plain JSON numbers for
 * money and epoch-millisecond numbers for timestamps. Prisma returns `Decimal`
 * and `Date` objects. Converting here — once, at the edge — keeps every
 * frontend component free of serialisation concerns.
 *
 *   Prisma.Decimal  →  number
 *   Date            →  number (epoch ms)
 */
function normalise(value: unknown): unknown {
  if (value === null || value === undefined) return value;

  if (value instanceof Date) return value.getTime();

  if (Prisma.Decimal.isDecimal(value)) {
    return (value as Prisma.Decimal).toNumber();
  }

  if (Array.isArray(value)) return value.map(normalise);

  if (typeof value === 'object') {
    // Leave exotic objects (Buffer, streams) alone.
    const proto = Object.getPrototypeOf(value);
    if (proto !== Object.prototype && proto !== null) return value;

    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      out[key] = normalise(val);
    }
    return out;
  }

  return value;
}

@Injectable()
export class SerializeInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(map((data) => normalise(data)));
  }
}
