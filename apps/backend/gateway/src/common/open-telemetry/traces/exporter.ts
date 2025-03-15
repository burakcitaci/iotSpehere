import { ExportResult, ExportResultCode } from '@opentelemetry/core';
import { ReadableSpan, SpanExporter } from '@opentelemetry/sdk-trace-node';
import { Logger } from '@nestjs/common';

export class GatewaySpanExporter implements SpanExporter {
  private readonly logger = new Logger(GatewaySpanExporter.name);
  private _isShutdown = false;
  private _pendingExports: Promise<void>[] = [];

  export(
    spans: ReadableSpan[],
    resultCallback: (result: ExportResult) => void
  ): void {
    if (this._isShutdown) {
      this.logger.warn('Attempted to export spans after exporter shutdown');
      resultCallback({ code: ExportResultCode.FAILED });
      return;
    }

    console.log(`Exporting ${spans.length} spans to Cassandra...`);

    const exportPromise = Promise.all(spans.map((span) => console.log(span)))
      .then(() => {
        console.log('Successfully stored spans in Cassandra.');
        resultCallback({ code: ExportResultCode.SUCCESS });
      })
      .catch((error) => {
        this.logger.error('Failed to store spans in Cassandra:', error);
        resultCallback({ code: ExportResultCode.FAILED, error });
      })
      .finally(() => {
        this._pendingExports = this._pendingExports.filter(
          (p) => p !== exportPromise
        );
      });

    this._pendingExports.push(exportPromise);
  }

  async shutdown(): Promise<void> {
    if (this._isShutdown) {
      return;
    }

    this.logger.log('Shutting down GatewaySpanExporter...');
    this._isShutdown = true;

    try {
      await Promise.allSettled(this._pendingExports);
      this.logger.log('GatewaySpanExporter shutdown complete');
    } catch (error) {
      this.logger.error('Error during GatewaySpanExporter shutdown:', error);
    }
  }

  async forceFlush(): Promise<void> {
    this.logger.log('Force flushing GatewaySpanExporter...');

    if (this._isShutdown) {
      return Promise.reject(new Error('Exporter is shutdown'));
    }

    try {
      await Promise.allSettled(this._pendingExports);
      this.logger.log('GatewaySpanExporter force flush complete');
    } catch (error) {
      this.logger.error('Error during GatewaySpanExporter force flush:', error);
      return Promise.reject(new Error(String(error)));
    }
  }
}
