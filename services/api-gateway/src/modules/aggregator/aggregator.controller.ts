import {
  Controller, Get, Post, Put, Body, Param, Query,
  ParseIntPipe, DefaultValuePipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AggregatorService } from './aggregator.service';
import {
  CreateProviderDto, UpdateProviderDto, CreateProviderPricingDto,
  RecordProviderHealthDto, ProviderListQueryDto,
} from './dto/provider.dto';
import { CurrentUser, type AuthUser } from '../../common/decorators/current-user.decorator';

@ApiTags('aggregator')
@ApiBearerAuth()
@Controller('v1/aggregator')
export class AggregatorController {
  constructor(private readonly service: AggregatorService) {}

  // ─── Providers ─────────────────────────────────────────────────────────────

  @Get('providers')
  @ApiOperation({ summary: 'List all providers' })
  listProviders(@CurrentUser() user: AuthUser, @Query() query: ProviderListQueryDto) {
    return this.service.listProviders(user.tenantId, query);
  }

  @Get('providers/:id')
  @ApiOperation({ summary: 'Get provider by ID' })
  getProvider(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.getProvider(user.tenantId, id);
  }

  @Post('providers')
  @ApiOperation({ summary: 'Create a new provider' })
  createProvider(@CurrentUser() user: AuthUser, @Body() dto: CreateProviderDto) {
    return this.service.createProvider(user.tenantId, dto);
  }

  @Put('providers/:id')
  @ApiOperation({ summary: 'Update a provider' })
  updateProvider(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateProviderDto) {
    return this.service.updateProvider(user.tenantId, id, dto);
  }

  @Get('providers/:id/pricing')
  @ApiOperation({ summary: 'List provider buy pricing' })
  listProviderPricing(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.listProviderPricing(user.tenantId, id);
  }

  @Post('providers/:id/pricing')
  @ApiOperation({ summary: 'Add provider pricing' })
  createProviderPricing(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: CreateProviderPricingDto,
  ) {
    return this.service.createProviderPricing(user.tenantId, id, dto);
  }

  @Get('providers/:id/health')
  @ApiOperation({ summary: 'Get provider health history' })
  listProviderHealth(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.service.listProviderHealth(user.tenantId, id, limit);
  }

  @Post('providers/:id/health')
  @ApiOperation({ summary: 'Record a provider health snapshot' })
  recordProviderHealth(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: RecordProviderHealthDto,
  ) {
    return this.service.recordProviderHealth(user.tenantId, id, dto);
  }

  // ─── Games ─────────────────────────────────────────────────────────────────

  @Get('games')
  @ApiOperation({ summary: 'List game catalog' })
  @ApiQuery({ name: 'providerId', required: false })
  @ApiQuery({ name: 'category', required: false })
  listGames(
    @CurrentUser() user: AuthUser,
    @Query('providerId') providerId?: string,
    @Query('category') category?: string,
    @Query('limit', new DefaultValuePipe(25), ParseIntPipe) limit?: number,
    @Query('cursor') cursor?: string,
  ) {
    return this.service.listGames(user.tenantId, { providerId, category, limit, cursor });
  }

  // ─── Operators ─────────────────────────────────────────────────────────────

  @Get('operators')
  @ApiOperation({ summary: 'List operators' })
  listOperators(@CurrentUser() user: AuthUser, @Query('status') status?: string) {
    return this.service.listOperators(user.tenantId, { status });
  }

  @Get('operators/:id')
  @ApiOperation({ summary: 'Get operator by ID' })
  getOperator(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.getOperator(user.tenantId, id);
  }

  @Post('operators')
  @ApiOperation({ summary: 'Create a new operator' })
  createOperator(@CurrentUser() user: AuthUser, @Body() body: { code: string; name: string }) {
    return this.service.createOperator(user.tenantId, body);
  }

  // ─── Agents ─────────────────────────────────────────────────────────────────

  @Get('agents')
  @ApiOperation({ summary: 'List agents' })
  listAgents(@CurrentUser() user: AuthUser) {
    return this.service.listAgents(user.tenantId);
  }

  // ─── Vendors ─────────────────────────────────────────────────────────────────

  @Get('vendors')
  @ApiOperation({ summary: 'List vendors' })
  listVendors(@CurrentUser() user: AuthUser) {
    return this.service.listVendors(user.tenantId);
  }

  // ─── Routes ─────────────────────────────────────────────────────────────────

  @Get('routes')
  @ApiOperation({ summary: 'List route policies' })
  listRoutePolicies(
    @CurrentUser() user: AuthUser,
    @Query('routeType') routeType?: string,
    @Query('status') status?: string,
  ) {
    return this.service.listRoutePolicies(user.tenantId, { routeType, status });
  }
}
