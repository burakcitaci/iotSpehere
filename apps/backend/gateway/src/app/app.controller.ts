import { Controller, Get, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { Trace } from '../common/open-telemetry/traces/trace';
import { SpanKind } from '@opentelemetry/api';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Trace({
    spanName: 'getData',
    tracerName: AppController.name,
    spanKind: SpanKind.CONSUMER,
    captureArgs: false,
  })
  getData() {
    Logger.log('Getting data...');
    return this.appService.getData();
  }
}
