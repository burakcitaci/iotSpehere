import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { OtelLogger } from './common/open-telemetry/logs/logger';
import {
  BatchLogRecordProcessor,
  LoggerProvider,
} from '@opentelemetry/sdk-logs';
import { Resource } from '@opentelemetry/resources';
import { GatewayLogExporter } from './common/open-telemetry/logs/log.exporter';

async function bootstrap() {
  const appWithLogger = await NestFactory.create(AppModule, {
    logger: new OtelLogger(createLoggerProvider().getLogger('gateway-api')),
  });

  const globalPrefix = 'api';
  appWithLogger.setGlobalPrefix(globalPrefix);
  const port = process.env.PORT ?? 3005;
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

bootstrap();
