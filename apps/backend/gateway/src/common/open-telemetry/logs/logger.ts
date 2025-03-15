import { LoggerService } from '@nestjs/common';
import { Logger, SeverityNumber } from '@opentelemetry/api-logs';

export class OtelLogger implements LoggerService {
  private readonly otelLogger: Logger;
  private readonly serviceName = 'gateway-api';
  constructor(otelLogger: Logger) {
    this.otelLogger = otelLogger;
  }

  log(message: string) {
    console.log(`[${this.serviceName}] INFO: `, message);
    this.otelLogger.emit({
      body: message,
      severityText: 'INFO',
      severityNumber: SeverityNumber.INFO,
    });
  }

  error(message: string, trace?: string) {
    console.error(`[${this.serviceName}] ERROR: ${message}`, trace);
    this.otelLogger.emit({
      body: message,
      severityText: 'ERROR',
      severityNumber: SeverityNumber.ERROR,
    });
  }

  warn(message: string) {
    console.warn(`[${this.serviceName}] WARN: ${message}`);
    this.otelLogger.emit({
      body: message,
      severityText: 'WARN',
      severityNumber: SeverityNumber.WARN,
    });
  }

  debug(message: string) {
    console.debug(`[${this.serviceName}] DEBUG: ${message}`);
    this.otelLogger.emit({
      body: message,
      severityText: 'DEBUG',
      severityNumber: SeverityNumber.DEBUG,
    });
  }

  verbose(message: string) {
    console.info(`[${this.serviceName}] VERBOSE: ${message}`);
    this.otelLogger.emit({
      body: message,
      severityText: 'TRACE',
      severityNumber: SeverityNumber.TRACE,
    });
  }
}
