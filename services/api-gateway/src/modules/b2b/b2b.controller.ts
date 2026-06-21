import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { B2bService } from './b2b.service';
import { CurrentUser, type AuthUser } from '../../common/decorators/current-user.decorator';

@ApiTags('b2b')
@ApiBearerAuth()
@Controller('v1/b2b')
export class B2bController {
  constructor(private readonly service: B2bService) {}

  @Get('white-labels')
  @ApiOperation({ summary: 'List white labels' })
  listWhiteLabels(@CurrentUser() user: AuthUser) { return this.service.listWhiteLabels(user.tenantId); }

  @Get('crm/accounts')
  @ApiOperation({ summary: 'List CRM accounts' })
  listCrmAccounts(@CurrentUser() user: AuthUser, @Query('status') status?: string) { return this.service.listCrmAccounts(user.tenantId, status); }

  @Get('invoices')
  @ApiOperation({ summary: 'List invoices' })
  listInvoices(@CurrentUser() user: AuthUser, @Query('status') status?: string) { return this.service.listInvoices(user.tenantId, status); }

  @Get('affiliates')
  @ApiOperation({ summary: 'List affiliates' })
  listAffiliates(@CurrentUser() user: AuthUser) { return this.service.listAffiliates(user.tenantId); }

  @Get('settlements')
  @ApiOperation({ summary: 'List settlement cycles' })
  listSettlements(@CurrentUser() user: AuthUser, @Query('status') status?: string) { return this.service.listSettlementCycles(user.tenantId, status); }
}
