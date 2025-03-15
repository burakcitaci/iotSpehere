import {
    context,
    SpanKind,
    SpanStatusCode,
    trace,
    type Span,
  } from '@opentelemetry/api';
  
  export interface TraceOptions {
    /** Custom tracer name (default: 'gateway-api') */
    tracerName?: string;
    /** Custom span name (default: method name) */
    spanName?: string;
    /** Span kind (default: SpanKind.SERVER) */
    spanKind?: SpanKind;
    /** Capture method arguments as attributes (default: false) */
    captureArgs?: boolean;
    /** Maximum length for captured arguments (default: 1024) */
    maxArgLength?: number;
    /** Record exception stack traces (default: true) */
    includeStackTrace?: boolean;
    /** Additional span attributes */
    attributes?: Record<string, unknown>;
  }
  
  const DEFAULT_OPTIONS: Partial<TraceOptions> = {
    tracerName: 'gateway-api',
    spanKind: SpanKind.SERVER,
    maxArgLength: 1024,
    includeStackTrace: true,
  };
  
  export function Trace(options?: TraceOptions | string): MethodDecorator {
    const normalizedOptions: TraceOptions =
      typeof options === 'string'
        ? { ...DEFAULT_OPTIONS, spanName: options }
        : {
            ...DEFAULT_OPTIONS,
            ...options,
            maxArgLength: options?.maxArgLength ?? DEFAULT_OPTIONS.maxArgLength,
          };
  
    return function (
      target: unknown,
      propertyKey: string | symbol,
      descriptor: PropertyDescriptor
    ) {
      const originalMethod = descriptor.value;
      if (typeof originalMethod !== 'function') {
        return descriptor;
      }
  
      const methodName = normalizedOptions.spanName ?? String(propertyKey);
      const tracer = trace.getTracer(
        normalizedOptions.tracerName ?? 'default-tracer'
      );
  
      descriptor.value = function (this: unknown, ...args: unknown[]) {
        const span = tracer.startSpan(methodName, {
          kind: normalizedOptions.spanKind,
          attributes: {
            'code.function': String(propertyKey),
            'code.namespace': target?.constructor?.name ?? '<anonymous>',
            ...normalizedOptions.attributes,
          },
        });
  
        if (normalizedOptions.captureArgs) {
          safeSetArguments(
            span,
            args,
            normalizedOptions.maxArgLength ?? DEFAULT_OPTIONS.maxArgLength ?? 1024
          );
        }
  
        const ctx = trace.setSpan(context.active(), span);
        return context.with(ctx, async () => {
          try {
            const result = await originalMethod.apply(this, args);
            span.setStatus({ code: SpanStatusCode.OK });
  
            return result;
          } catch (error) {
            handleError(span, error, normalizedOptions.includeStackTrace ?? true);
            throw error;
          } finally {
            span.end();
          }
        });
      };
  
      return descriptor;
    };
  }
  
  function safeSetArguments(
    span: Span,
    args: unknown[],
    maxLength: number
  ): void {
    try {
      const argsString = JSON.stringify(args, (_, value) =>
        typeof value === 'bigint' ? value.toString() : value
      );
      span.setAttribute('function.args', truncateString(argsString, maxLength));
    } catch (error) {
      span.setAttribute('function.args', `<failed to serialize: ${error}>`);
    }
  }
  
  function handleError(
    span: Span,
    error: unknown,
    includeStackTrace: boolean
  ): void {
    const message = error instanceof Error ? error.message : String(error);
  
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: truncateString(message, 255),
    });
  
    if (includeStackTrace && error instanceof Error) {
      span.recordException(error);
    } else {
      span.recordException(new Error(message));
    }
  }
  
  function truncateString(value: string, maxLength: number): string {
    return value.length > maxLength
      ? `${value.slice(0, maxLength)}... [truncated]`
      : value;
  }
  