import { Module } from '@nestjs/common';
import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { Registry, collectDefaultMetrics, Counter, Histogram } from 'prom-client';
import { Public } from '../../common/decorators/auth.decorator';

// Initialize Prometheus metrics registry
const register = new Registry();
register.setDefaultLabels({ app: 'api-gateway' });
collectDefaultMetrics({ register });

export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'path', 'status'],
  registers: [register],
});

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'path', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [register],
});

@Controller()
class MetricsController {
  @Public()
  @Get('metrics')
  async metrics(@Res() res: Response) {
    res.set('Content-Type', register.contentType);
    res.send(await register.metrics());
  }
}

@Module({ controllers: [MetricsController] })
export class MetricsModule {}
