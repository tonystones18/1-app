import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateProviderDto, UpdateProviderDto, CreateProviderPricingDto, RecordProviderHealthDto, ProviderListQueryDto } from './dto/provider.dto';

@Injectable()
export class AggregatorService {
  private readonly logger = new Logger(AggregatorService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── Providers ─────────────────────────────────────────────────────────────

  async listProviders(tenantId: string, query: ProviderListQueryDto) {
    const { status, limit = 25, cursor } = query;
    const providers = await this.prisma.provider.findMany({
      where: { tenantId, ...(status ? { status } : {}) },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    });

    const hasMore = providers.length > limit;
    return {
      providers: providers.slice(0, limit),
      hasMore,
      nextCursor: hasMore ? providers[limit - 1]?.id : null,
    };
  }

  async getProvider(tenantId: string, providerId: string) {
    const provider = await this.prisma.provider.findFirst({
      where: { id: providerId, tenantId },
      include: {
        contracts: { orderBy: { createdAt: 'desc' }, take: 1 },
        health: { orderBy: { checkedAt: 'desc' }, take: 1 },
      },
    });
    if (!provider) throw new NotFoundException(`Provider ${providerId} not found`);
    return provider;
  }

  async createProvider(tenantId: string, dto: CreateProviderDto) {
    return this.prisma.provider.create({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: { ...(dto as any), tenantId, status: 'DRAFT' as const },
    });
  }

  async updateProvider(tenantId: string, providerId: string, dto: UpdateProviderDto) {
    await this.getProvider(tenantId, providerId);
    return this.prisma.provider.update({
      where: { id: providerId },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: dto as any,
    });
  }

  async listProviderPricing(tenantId: string, providerId: string) {
    await this.getProvider(tenantId, providerId);
    return this.prisma.providerPricing.findMany({
      where: { tenantId, providerId },
      orderBy: { effectiveAt: 'desc' },
    });
  }

  async createProviderPricing(tenantId: string, providerId: string, dto: CreateProviderPricingDto) {
    await this.getProvider(tenantId, providerId);
    return this.prisma.providerPricing.create({
      data: {
        ...dto,
        effectiveAt: new Date(dto.effectiveAt),
        tenantId,
        providerId,
      },
    });
  }

  async listProviderHealth(tenantId: string, providerId: string, limit = 20) {
    await this.getProvider(tenantId, providerId);
    return this.prisma.providerHealth.findMany({
      where: { tenantId, providerId },
      orderBy: { checkedAt: 'desc' },
      take: limit,
    });
  }

  async recordProviderHealth(tenantId: string, providerId: string, dto: RecordProviderHealthDto) {
    await this.getProvider(tenantId, providerId);
    const { details, errorRate, ...rest } = dto;
    return this.prisma.providerHealth.create({
      data: {
        ...rest,
        tenantId,
        providerId,
        checkedAt: new Date(),
        ...(errorRate !== undefined ? { errorRate } : {}),
        ...(details ? { details: details as Prisma.InputJsonValue } : {}),
      },
    });
  }

  // ─── Games ─────────────────────────────────────────────────────────────────

  async listGames(tenantId: string, query: { providerId?: string; category?: string; limit?: number; cursor?: string }) {
    const { providerId, category, limit = 25, cursor } = query;
    const games = await this.prisma.game.findMany({
      where: {
        tenantId,
        ...(providerId ? { providerId } : {}),
        ...(category ? { category } : {}),
      },
      orderBy: { name: 'asc' },
      take: limit + 1,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    });
    const hasMore = games.length > limit;
    return { games: games.slice(0, limit), hasMore, nextCursor: hasMore ? games[limit - 1]?.id : null };
  }

  // ─── Operators ─────────────────────────────────────────────────────────────

  async listOperators(tenantId: string, query: { status?: string; limit?: number }) {
    const { status, limit = 25 } = query;
    return this.prisma.operator.findMany({
      where: { tenantId, ...(status ? { status: status as 'DRAFT' | 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED' } : {}) },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getOperator(tenantId: string, operatorId: string) {
    const op = await this.prisma.operator.findFirst({ where: { id: operatorId, tenantId } });
    if (!op) throw new NotFoundException(`Operator ${operatorId} not found`);
    return op;
  }

  async createOperator(tenantId: string, data: { code: string; name: string; metadata?: Record<string, unknown> }) {
    const { metadata, ...rest } = data;
    return this.prisma.operator.create({
      data: {
        ...rest,
        tenantId,
        status: 'DRAFT' as const,
        ...(metadata ? { metadata: metadata as Prisma.InputJsonValue } : {}),
      },
    });
  }

  // ─── Agents ─────────────────────────────────────────────────────────────────

  async listAgents(tenantId: string, limit = 25) {
    return this.prisma.agent.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  // ─── Vendors ────────────────────────────────────────────────────────────────

  async listVendors(tenantId: string, limit = 25) {
    return this.prisma.vendor.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  // ─── Route Policies ─────────────────────────────────────────────────────────

  async listRoutePolicies(tenantId: string, query: { routeType?: string; status?: string; limit?: number }) {
    const { routeType, status, limit = 25 } = query;
    return this.prisma.routePolicy.findMany({
      where: {
        tenantId,
        ...(routeType ? { routeType: routeType as 'GAME_LAUNCH' | 'WALLET' | 'CALLBACK' | 'PAYMENT' } : {}),
        ...(status ? { status: status as 'DRAFT' | 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED' } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
