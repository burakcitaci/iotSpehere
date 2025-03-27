import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { OtelLogger } from './common/open-telemetry/logs/logger';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import {
  BatchLogRecordProcessor,
  LoggerProvider,
} from '@opentelemetry/sdk-logs';
import { Resource } from '@opentelemetry/resources';
import { GatewayLogExporter } from './common/open-telemetry/logs/exporter';
import {
  BatchSpanProcessor,
  NodeTracerProvider,
} from '@opentelemetry/sdk-trace-node';
import { GatewaySpanExporter } from './common/open-telemetry/traces/exporter';
import { ClientRequest, IncomingMessage, ServerResponse } from 'http';

/*************  ✨ Codeium Command ⭐  *************/
/**
 * Initializes tracing and bootstraps the Nest.js application.
 *
 * @remarks
 * Performs the following steps:
 * 1. Initializes tracing.
 * 2. Creates a new Nest.js application with the {@link AppModule}.
 * 3. Configures the logger to use the {@link OtelLogger}.
 * 4. Sets the global prefix for the application.
 * 5. Listens on the specified port.
 * 6. Logs a message to the console indicating the application is running.
 */
/******  91b51717-d546-499d-b448-d715f0a013ea  *******/ async function bootstrap() {
  initializeTracing();
  const appWithLogger = await NestFactory.create(AppModule, {
    logger: new OtelLogger(createLoggerProvider().getLogger('gateway-api')),
  });

  const globalPrefix = 'api';
  appWithLogger.setGlobalPrefix(globalPrefix);

  appWithLogger.enableCors();
  const port = process.env.PORT ?? 3001;
  await appWithLogger.listen(port);

  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

function createLoggerProvider() {
  const loggerProvider = new LoggerProvider({
    resource: new Resource({
      'service.name': 'gateway-api',
    }),
  });

  loggerProvider.addLogRecordProcessor(
    new BatchLogRecordProcessor(new GatewayLogExporter())
  );
  return loggerProvider;
}

function initializeTracing() {
  console.log('Initializing telemetry...');

  // Create the provider
  const provider = new NodeTracerProvider({
    resource: new Resource({
      ['service.name']: 'gateway-api',
      ['service.version']: '0.0.2',
    }),
    spanProcessors: [
      //new BatchSpanProcessor(traceExporter),
      new BatchSpanProcessor(new GatewaySpanExporter()),
    ],
  });

  // Register the provider globally
  provider.register();

  // Register instrumentations
  registerInstrumentations({
    instrumentations: [
      new HttpInstrumentation({
        requestHook: (span, request: ClientRequest | IncomingMessage) => {
          const method = 'method' in request ? request.method : undefined;
          const url = 'url' in request ? request.url : undefined;

          if (method) {
            span.setAttribute('http.method', method);
          }
          if (url) {
            span.setAttribute('http.url', url);
          }
        },
        responseHook: (
          span,
          response: IncomingMessage | ServerResponse<IncomingMessage>
        ) => {
          if (
            'statusCode' in response &&
            typeof response.statusCode === 'number'
          ) {
            span.setAttribute('http.status_code', response.statusCode);
          }
        },
      }),
    ],
  });
}

bootstrap();
