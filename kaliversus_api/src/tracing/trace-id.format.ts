import { context, trace } from '@opentelemetry/api';
import * as winston from 'winston';

export const traceIdFormat = winston.format((info) => {
  const span = trace.getSpan(context.active());
  if (span) {
    const traceId = span.spanContext().traceId;
    info.traceId = traceId;
  }
  return info;
});
