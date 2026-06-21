import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class B2cService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Players ────────────────────────────────────────────────────────────────

  async listPlayers(tenantId: string, query: {
    operatorId?: string; status?: string; kycStatus?: string; search?: string; limit?: number; cursor?: string;
  }) {
    const { operatorId, status, kycStatus, limit = 25, cursor } = query;
    const players = await this.prisma.player.findMany({
      where: {
        tenantId,
        ...(operatorId ? { operatorId } : {}),
        ...(status ? { status: status as 'ACTIVE' } : {}),
        ...(kycStatus ? { kycStatus: kycStatus as 'PASSED' } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    });
    const hasMore = players.length > limit;
    return { players: players.slice(0, limit), hasMore, nextCursor: hasMore ? players[limit - 1]?.id : null };
  }

  async getPlayer(tenantId: string, playerId: string) {
    const player = await this.prisma.player.findFirst({
      where: { id: playerId, tenantId },
      include: { wallets: true, documents: true, notes: { orderBy: { createdAt: 'desc' }, take: 5 } },
    });
    if (!player) throw new NotFoundException(`Player ${playerId} not found`);
    return player;
  }

  async createPlayer(tenantId: string, data: {
    operatorId: string; email: string; displayName: string;
    country: string; currency: string; language?: string;
    firstName?: string; lastName?: string; dateOfBirth?: string;
    mobileNumber?: string;
  }) {
    return this.prisma.player.create({
      data: {
        ...data,
        tenantId,
        status: 'PENDING_VERIFICATION',
        riskLevel: 'LOW',
        kycStatus: 'NOT_STARTED',
        emailVerified: false,
        mobileVerified: false,
        deviceFingerprints: [],
        tags: [],
      },
    });
  }

  async updatePlayerStatus(tenantId: string, playerId: string, status: string) {
    await this.getPlayer(tenantId, playerId);
    return this.prisma.player.update({ where: { id: playerId }, data: { status: status as 'ACTIVE' } });
  }

  // ─── Wallets ─────────────────────────────────────────────────────────────────

  async getPlayerWallets(tenantId: string, playerId: string) {
    await this.getPlayer(tenantId, playerId);
    return this.prisma.wallet.findMany({ where: { tenantId, playerId } });
  }

  async getWalletLedger(tenantId: string, walletId: string, limit = 50) {
    return this.prisma.walletLedgerEntry.findMany({
      where: { tenantId, walletId },
      orderBy: { postedAt: 'desc' },
      take: limit,
    });
  }

  // ─── Payments ─────────────────────────────────────────────────────────────────

  async listPayments(tenantId: string, query: {
    operatorId?: string; playerId?: string; direction?: string; status?: string; limit?: number;
  }) {
    const { operatorId, playerId, direction, status, limit = 25 } = query;
    return this.prisma.payment.findMany({
      where: {
        tenantId,
        ...(operatorId ? { operatorId } : {}),
        ...(playerId ? { playerId } : {}),
        ...(direction ? { direction } : {}),
        ...(status ? { status } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getPayment(tenantId: string, paymentId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { id: paymentId, tenantId },
      include: { withdrawalApproval: true },
    });
    if (!payment) throw new NotFoundException(`Payment ${paymentId} not found`);
    return payment;
  }

  async listPendingWithdrawals(tenantId: string) {
    return this.prisma.withdrawalApproval.findMany({
      where: { tenantId, status: 'pending_approval' },
      include: { payment: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  // ─── Bonuses ─────────────────────────────────────────────────────────────────

  async listBonusInstances(tenantId: string, playerId?: string, status?: string) {
    return this.prisma.bonusInstance.findMany({
      where: {
        tenantId,
        ...(playerId ? { playerId } : {}),
        ...(status ? { status } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { template: { select: { name: true, type: true } } },
    });
  }

  async listBonusTemplates(tenantId: string) {
    return this.prisma.bonusTemplate.findMany({
      where: { tenantId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─── VIP ─────────────────────────────────────────────────────────────────────

  async listVipTiers(tenantId: string) {
    return this.prisma.vipTier.findMany({ where: { tenantId, isActive: true }, orderBy: { level: 'asc' } });
  }

  async getPlayerVipStatus(tenantId: string, playerId: string) {
    return this.prisma.playerVipStatus.findFirst({ where: { playerId }, include: { tier: true } });
  }

  // ─── Compliance ──────────────────────────────────────────────────────────────

  async listKycCases(tenantId: string, status?: string, limit = 25) {
    return this.prisma.kycCase.findMany({
      where: { tenantId, ...(status ? { status } : {}) },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async listAmlAlerts(tenantId: string, status?: string) {
    return this.prisma.amlAlert.findMany({
      where: { tenantId, ...(status ? { status } : { status: 'open' }) },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listRgLimits(tenantId: string, playerId?: string) {
    return this.prisma.responsibleGamingLimit.findMany({
      where: { tenantId, ...(playerId ? { playerId } : {}), isActive: true },
    });
  }
}
