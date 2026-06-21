import { Controller, Get, Post, Put, Body, Param, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { B2cService } from './b2c.service';
import { CurrentUser, type AuthUser } from '../../common/decorators/current-user.decorator';

@ApiTags('b2c')
@ApiBearerAuth()
@Controller('v1/b2c')
export class B2cController {
  constructor(private readonly service: B2cService) {}

  // ─── Players ────────────────────────────────────────────────────────────────

  @Get('players')
  @ApiOperation({ summary: 'List players' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'kycStatus', required: false })
  listPlayers(
    @CurrentUser() user: AuthUser,
    @Query('operatorId') operatorId?: string,
    @Query('status') status?: string,
    @Query('kycStatus') kycStatus?: string,
    @Query('limit', new DefaultValuePipe(25), ParseIntPipe) limit?: number,
    @Query('cursor') cursor?: string,
  ) {
    return this.service.listPlayers(user.tenantId, { operatorId, status, kycStatus, limit, cursor });
  }

  @Get('players/:id')
  @ApiOperation({ summary: 'Get player details' })
  getPlayer(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.getPlayer(user.tenantId, id);
  }

  @Post('players')
  @ApiOperation({ summary: 'Create a player' })
  createPlayer(@CurrentUser() user: AuthUser, @Body() body: {
    operatorId: string; email: string; displayName: string;
    country: string; currency: string; language?: string;
  }) {
    return this.service.createPlayer(user.tenantId, body);
  }

  @Put('players/:id/status')
  @ApiOperation({ summary: 'Update player status' })
  updatePlayerStatus(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() body: { status: string }) {
    return this.service.updatePlayerStatus(user.tenantId, id, body.status);
  }

  // ─── Wallets ────────────────────────────────────────────────────────────────

  @Get('players/:id/wallets')
  @ApiOperation({ summary: 'Get player wallets' })
  getPlayerWallets(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.getPlayerWallets(user.tenantId, id);
  }

  @Get('wallets/:walletId/ledger')
  @ApiOperation({ summary: 'Get wallet ledger entries' })
  getWalletLedger(
    @CurrentUser() user: AuthUser,
    @Param('walletId') walletId: string,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    return this.service.getWalletLedger(user.tenantId, walletId, limit);
  }

  // ─── Payments ───────────────────────────────────────────────────────────────

  @Get('payments')
  @ApiOperation({ summary: 'List payments' })
  listPayments(
    @CurrentUser() user: AuthUser,
    @Query('playerId') playerId?: string,
    @Query('direction') direction?: string,
    @Query('status') status?: string,
    @Query('limit', new DefaultValuePipe(25), ParseIntPipe) limit?: number,
  ) {
    return this.service.listPayments(user.tenantId, { playerId, direction, status, limit });
  }

  @Get('payments/:id')
  @ApiOperation({ summary: 'Get payment details' })
  getPayment(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.getPayment(user.tenantId, id);
  }

  @Get('withdrawals/pending')
  @ApiOperation({ summary: 'List pending withdrawal approvals' })
  listPendingWithdrawals(@CurrentUser() user: AuthUser) {
    return this.service.listPendingWithdrawals(user.tenantId);
  }

  // ─── Bonuses ────────────────────────────────────────────────────────────────

  @Get('bonuses/templates')
  @ApiOperation({ summary: 'List bonus templates' })
  listBonusTemplates(@CurrentUser() user: AuthUser) {
    return this.service.listBonusTemplates(user.tenantId);
  }

  @Get('bonuses/instances')
  @ApiOperation({ summary: 'List bonus instances' })
  listBonusInstances(
    @CurrentUser() user: AuthUser,
    @Query('playerId') playerId?: string,
    @Query('status') status?: string,
  ) {
    return this.service.listBonusInstances(user.tenantId, playerId, status);
  }

  // ─── VIP ────────────────────────────────────────────────────────────────────

  @Get('vip/tiers')
  @ApiOperation({ summary: 'List VIP tiers' })
  listVipTiers(@CurrentUser() user: AuthUser) {
    return this.service.listVipTiers(user.tenantId);
  }

  @Get('vip/players/:id')
  @ApiOperation({ summary: 'Get player VIP status' })
  getPlayerVipStatus(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.getPlayerVipStatus(user.tenantId, id);
  }

  // ─── Compliance ─────────────────────────────────────────────────────────────

  @Get('compliance/kyc')
  @ApiOperation({ summary: 'List KYC cases' })
  listKycCases(@CurrentUser() user: AuthUser, @Query('status') status?: string) {
    return this.service.listKycCases(user.tenantId, status);
  }

  @Get('compliance/aml')
  @ApiOperation({ summary: 'List AML alerts' })
  listAmlAlerts(@CurrentUser() user: AuthUser, @Query('status') status?: string) {
    return this.service.listAmlAlerts(user.tenantId, status);
  }

  @Get('compliance/rg')
  @ApiOperation({ summary: 'List responsible gaming limits' })
  listRgLimits(@CurrentUser() user: AuthUser, @Query('playerId') playerId?: string) {
    return this.service.listRgLimits(user.tenantId, playerId);
  }
}
