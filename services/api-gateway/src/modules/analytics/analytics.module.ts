import { Module } from '@nestjs/common';
import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Injectable } from '@nestjs/common';
import { CurrentUser, type AuthUser } from '../../common/decorators/current-user.decorator';

@Injectable()
class AnalyticsService {}

@ApiTags('analytics')
@ApiBearerAuth()
@Controller('v1/analytics')
class AnalyticsController {
  @Get('summary')
  @ApiOperation({ summary: 'Platform analytics summary' })
  getSummary(@CurrentUser() _user: AuthUser, @Query('from') _from?: string, @Query('to') _to?: string) {
    return {
      ggr: '0.00', ngr: '0.00', activeOperators: 0, activePlayers: 0,
      totalDeposits: '0.00', totalWithdrawals: '0.00',
      currency: 'USD', period: { from: _from, to: _to },
    };
  }

  @Get('kpis')
  @ApiOperation({ summary: 'KPI catalog values' })
  getKpis(@CurrentUser() _user: AuthUser) { return { kpis: [] }; }
}

@Module({ controllers: [AnalyticsController], providers: [AnalyticsService] })
export class AnalyticsModule {}
