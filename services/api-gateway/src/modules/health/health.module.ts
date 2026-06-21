import { Module } from '@nestjs/common';
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../common/decorators/auth.decorator';

@ApiTags('health')
@Controller()
class HealthController {
  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Health check' })
  health() {
    return { status: 'ok', service: 'api-gateway', version: '1.0.0', timestamp: new Date().toISOString() };
  }

  @Public()
  @Get()
  root() {
    return { name: 'VisioneSoft API Gateway', version: '1.0.0', docs: '/docs' };
  }
}

@Module({ controllers: [HealthController] })
export class HealthModule {}
