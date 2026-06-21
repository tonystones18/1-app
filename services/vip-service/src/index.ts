// VIP Service — VIP Tiers, Player VIP Status, Rewards

import type { ActorContext } from "@visionesoft/shared-types";
import { createAuditEvent } from "@visionesoft/audit";

export interface VipTier {
  id: string;
  tenantId: string;
  operatorId: string;
  name: string;
  level: number;
  minPoints: number;
  maxPoints?: number;
  color: string;
  benefits: VipBenefit[];
  withdrawalLimit?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VipBenefit {
  type: "withdrawal_limit_increase" | "cashback_rate" | "personal_host" | "birthday_bonus" | "fast_withdrawal" | "exclusive_games" | "custom";
  value?: string;
  description: string;
}

export interface PlayerVipStatus {
  id: string;
  playerId: string;
  tenantId: string;
  operatorId: string;
  tierId: string;
  currentPoints: number;
  lifetimePoints: number;
  hostId?: string;
  notes?: string;
  promotedAt?: string;
  reviewAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VipPointsEvent {
  id: string;
  playerId: string;
  tenantId: string;
  operatorId: string;
  sourceType: "bet" | "deposit" | "manual" | "birthday" | "promotion";
  sourceId: string;
  points: number;
  runningPoints: number;
  postedAt: string;
}

export interface CreateVipTierInput {
  tenantId: string;
  operatorId: string;
  name: string;
  level: number;
  minPoints: number;
  maxPoints?: number;
  color?: string;
  benefits?: VipBenefit[];
  withdrawalLimit?: string;
}

export interface AwardPointsInput {
  playerId: string;
  tenantId: string;
  operatorId: string;
  sourceType: VipPointsEvent["sourceType"];
  sourceId: string;
  points: number;
}

export class VipError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message);
    this.name = "VipError";
  }
}

export interface VipDatabaseClient {
  vipTier: {
    findUnique(args: { where: { id: string } }): Promise<VipTier | null>;
    findMany(args: { where: Record<string, unknown>; orderBy?: Record<string, unknown> }): Promise<VipTier[]>;
    create(args: { data: VipTier }): Promise<VipTier>;
    update(args: { where: { id: string }; data: Partial<VipTier> }): Promise<VipTier>;
  };
  playerVipStatus: {
    findUnique(args: { where: { playerId: string } }): Promise<PlayerVipStatus | null>;
    create(args: { data: PlayerVipStatus }): Promise<PlayerVipStatus>;
    update(args: { where: { id: string }; data: Partial<PlayerVipStatus> }): Promise<PlayerVipStatus>;
  };
  vipPointsEvent: {
    create(args: { data: VipPointsEvent }): Promise<VipPointsEvent>;
    findMany(args: { where: Record<string, unknown>; orderBy?: Record<string, unknown>; take?: number }): Promise<VipPointsEvent[]>;
  };
  auditLog: { create(args: { data: Record<string, unknown> }): Promise<void> };
  outboxEvent: { create(args: { data: Record<string, unknown> }): Promise<void> };
  $transaction<T>(fn: (tx: VipDatabaseClient) => Promise<T>): Promise<T>;
}

export class VipService {
  constructor(private readonly db: VipDatabaseClient) {}

  async createTier(input: CreateVipTierInput, actor: ActorContext, requestId: string): Promise<VipTier> {
    const now = new Date().toISOString();
    return this.db.vipTier.create({
      data: {
        id: crypto.randomUUID(),
        tenantId: input.tenantId,
        operatorId: input.operatorId,
        name: input.name,
        level: input.level,
        minPoints: input.minPoints,
        maxPoints: input.maxPoints,
        color: input.color ?? "#gold",
        benefits: input.benefits ?? [],
        withdrawalLimit: input.withdrawalLimit,
        isActive: true,
        createdAt: now,
        updatedAt: now
      }
    });
  }

  async awardPoints(input: AwardPointsInput, actor: ActorContext, requestId: string): Promise<{ status: PlayerVipStatus; tierId: string; tierChanged: boolean }> {
    const now = new Date().toISOString();

    let vipStatus = await this.db.playerVipStatus.findUnique({ where: { playerId: input.playerId } });

    // Initialize VIP status if first points award
    const tiers = await this.db.vipTier.findMany({
      where: { tenantId: input.tenantId, operatorId: input.operatorId, isActive: true },
      orderBy: { minPoints: "asc" } as Record<string, unknown>
    });

    const lowestTier = tiers[0];
    if (!lowestTier) throw new VipError("NO_TIERS", "No VIP tiers configured");

    let statusId: string;
    let previousTierId: string;
    let currentPoints: number;
    let lifetimePoints: number;

    return this.db.$transaction(async (tx) => {
      if (!vipStatus) {
        statusId = crypto.randomUUID();
        currentPoints = input.points;
        lifetimePoints = input.points;
        previousTierId = lowestTier.id;

        vipStatus = await tx.playerVipStatus.create({
          data: {
            id: statusId,
            playerId: input.playerId,
            tenantId: input.tenantId,
            operatorId: input.operatorId,
            tierId: lowestTier.id,
            currentPoints,
            lifetimePoints,
            createdAt: now,
            updatedAt: now
          }
        });
      } else {
        statusId = vipStatus.id;
        previousTierId = vipStatus.tierId;
        currentPoints = vipStatus.currentPoints + input.points;
        lifetimePoints = vipStatus.lifetimePoints + input.points;
      }

      // Determine new tier
      const newTier = [...tiers].reverse().find((t) => lifetimePoints >= t.minPoints) ?? lowestTier;
      const tierChanged = newTier.id !== previousTierId;

      const updated = await tx.playerVipStatus.update({
        where: { id: statusId },
        data: {
          currentPoints,
          lifetimePoints,
          tierId: newTier.id,
          promotedAt: tierChanged ? now : undefined,
          updatedAt: now
        }
      });

      await tx.vipPointsEvent.create({
        data: {
          id: crypto.randomUUID(),
          playerId: input.playerId,
          tenantId: input.tenantId,
          operatorId: input.operatorId,
          sourceType: input.sourceType,
          sourceId: input.sourceId,
          points: input.points,
          runningPoints: currentPoints,
          postedAt: now
        }
      });

      if (tierChanged) {
        await tx.outboxEvent.create({
          data: {
            id: crypto.randomUUID(), tenantId: input.tenantId, name: "vip.tier_changed",
            aggregateType: "Player", aggregateId: input.playerId,
            payload: { playerId: input.playerId, previousTierId, newTierId: newTier.id, points: currentPoints },
            schemaVersion: 1, status: "PENDING", attempts: 0, createdAt: now, updatedAt: now
          }
        });
      }

      return { status: updated, tierId: newTier.id, tierChanged };
    });
  }

  async getTiers(tenantId: string, operatorId: string): Promise<VipTier[]> {
    return this.db.vipTier.findMany({
      where: { tenantId, operatorId, isActive: true },
      orderBy: { level: "asc" } as Record<string, unknown>
    });
  }

  async getPlayerStatus(playerId: string): Promise<PlayerVipStatus | null> {
    return this.db.playerVipStatus.findUnique({ where: { playerId } });
  }
}
