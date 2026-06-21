import { Module } from '@nestjs/common';
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Injectable } from '@nestjs/common';
import { CurrentUser, type AuthUser } from '../../common/decorators/current-user.decorator';

@Injectable()
class FinanceService {}

@ApiTags('finance')
@ApiBearerAuth()
@Controller('v1/finance')
class FinanceController {
  @Get('summary')
  @ApiOperation({ summary: 'Get finance summary' })
  getSummary(@CurrentUser() _user: AuthUser) {
    return {
      totalGgr: '0.00',
      totalNgr: '0.00',
      openSettlements: 0,
      outstandingInvoices: 0,
      treasuryBalance: '0.00',
      currency: 'USD',
    };
  }
}

@Module({ controllers: [FinanceController], providers: [FinanceService] })
export class FinanceModule {}
