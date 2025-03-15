import { LogRecordExporter, ReadableLogRecord } from '@opentelemetry/sdk-logs';
import { Logger } from '@nestjs/common';
import { ExportResultCode } from '@opentelemetry/core';

export class GatewayLogExporter implements LogRecordExporter {
  private readonly logger = new Logger(GatewayLogExporter.name);
  private _isShutdown = false;
  private _pendingExports: Promise<void>[] = [];

  export(
    logs: ReadableLogRecord[],
    resultCallback: (result: { code: ExportResultCode }) => void
  ): void {
    if (this._isShutdown) {
      this.logger.warn('Attempted to export logs after exporter shutdown');
      resultCallback({ code: ExportResultCode.FAILED });
      return;
    }

    const exportPromise = Promise.allSettled(
      logs.map((log) => {
        // Instead, send it to your log storage or monitoring system
        console.log(log);
      })
    )
      .then(() => {
        resultCallback({ code: ExportResultCode.SUCCESS });
      })
      .catch(() => {
        resultCallback({ code: ExportResultCode.FAILED });
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

    this.logger.log('Shutting down GatewayLogExporter...');
    this._isShutdown = true;

    try {
      await Promise.allSettled(this._pendingExports);
      this.logger.log('GatewayLogExporter shutdown complete');
    } catch (error) {
      this.logger.error('Error during GatewayLogExporter shutdown:', error);
    }
  }
}
