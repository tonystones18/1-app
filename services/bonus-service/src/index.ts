// Bonus Service — Bonus Engine, Templates, Instances, Wagering

import type { ActorContext } from "@visionesoft/shared-types";
import { createAuditEvent } from "@visionesoft/audit";

// ─── Enums / Types ────────────────────────────────────────────────────────────

export type BonusType =
  | "deposit_match"
  | "free_spins"
  | "cashback"
  | "lossback"
  | "no_deposit"
  | "referral"
  | "vip"
  | "tournament"
  | "sports_free_bet"
  | "reload";

export type BonusStatus =
  | "pending"
  | "active"
  | "wagering"
  | "completed"
  | "expired"
  | "cancelled"
  | "forfeited";

export type WageringContributionScope = "all" | "slots" | "table" | "live" | "sports" | "specific_game";

// ─── Domain Records ────────────────────────────────────────────────────────────

export interface BonusTemplate {
  id: string;
  tenantId: string;
  operatorId: string;
  code: string;
  name: string;
  type: BonusType;
  isActive: boolean;
  currency: string;
  minDeposit?: string;
  maxBonusAmount?: string;
  matchPercent?: number;
  freeSpinCount?: number;
  freeSpinValue?: string;
  wageringMultiplier: number;
  maxWageringContribution?: string;
  expiryDays: number;
  wageringContributions: WageringContribution[];
  eligibilityRules: BonusEligibilityRule[];
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface WageringContribution {
  scope: WageringContributionScope;
  gameId?: string;
  contributionPercent: number;
}

export interface BonusEligibilityRule {
  type: "min_deposit" | "kyc_required" | "country_whitelist" | "country_blacklist" | "first_deposit_only" | "max_claims";
  value: string | number | string[];
}

export interface BonusInstance {
  id: string;
  templateId: string;
  tenantId: string;
  operatorId: string;
  playerId: string;
  walletId: string;
  type: BonusType;
  status: BonusStatus;
  currency: string;
  bonusAmount: string;
  remainingAmount: string;
  wageringRequired: string;
  wageringCompleted: string;
  freeSpinCount?: number;
  freeSpinsUsed?: number;
  expiresAt: string;
  activatedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface BonusLedgerEntry {
  id: string;
  instanceId: string;
  tenantId: string;
  playerId: string;
  type: "grant" | "wagering_contribution" | "conversion" | "expiry" | "cancellation";
  amount: string;
  wageringContribution?: string;
  gameId?: string;
  betId?: string;
  postedAt: string;
}

// ─── Inputs ────────────────────────────────────────────────────────────────

export interface CreateBonusTemplateInput {
  tenantId: string;
  operatorId: string;
  code: string;
  name: string;
  type: BonusType;
  currency: string;
  minDeposit?: string;
  maxBonusAmount?: string;
  matchPercent?: number;
  freeSpinCount?: number;
  freeSpinValue?: string;
  wageringMultiplier?: number;
  expiryDays?: number;
  wageringContributions?: WageringContribution[];
  eligibilityRules?: BonusEligibilityRule[];
}

export interface GrantBonusInput {
  templateId: string;
  tenantId: string;
  operatorId: string;
  playerId: string;
  walletId: string;
  depositAmount?: string;
  idempotencyKey: string;
}

export interface RecordWageringInput {
  instanceId: string;
  gameId: string;
  betId: string;
  betAmount: string;
  gameCategory: string;
}

// ─── Validation ───────────────────────────────────────────────────────────────

export class BonusError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message);
    this.name = "BonusError";
  }
}

// ─── DB Client Interface ──────────────────────────────────────────────────────

export interface BonusDatabaseClient {
  bonusTemplate: {
    findUnique(args: { where: { id: string } | { tenantId_code: { tenantId: string; code: string } } }): Promise<BonusTemplate | null>;
    findMany(args: { where: Record<string, unknown> }): Promise<BonusTemplate[]>;
    create(args: { data: BonusTemplate }): Promise<BonusTemplate>;
    update(args: { where: { id: string }; data: Partial<BonusTemplate> }): Promise<BonusTemplate>;
  };
  bonusInstance: {
    findUnique(args: { where: { id: string } }): Promise<BonusInstance | null>;
    findMany(args: { where: Record<string, unknown>; orderBy?: Record<string, unknown> }): Promise<BonusInstance[]>;
    create(args: { data: BonusInstance }): Promise<BonusInstance>;
    update(args: { where: { id: string }; data: Partial<BonusInstance> }): Promise<BonusInstance>;
  };
  bonusLedger: {
    create(args: { data: BonusLedgerEntry }): Promise<BonusLedgerEntry>;
    findMany(args: { where: Record<string, unknown> }): Promise<BonusLedgerEntry[]>;
  };
  auditLog: { create(args: { data: Record<string, unknown> }): Promise<void> };
  outboxEvent: { create(args: { data: Record<string, unknown> }): Promise<void> };
  $transaction<T>(fn: (tx: BonusDatabaseClient) => Promise<T>): Promise<T>;
}

// ─── Bonus Service ────────────────────────────────────────────────────────────

export class BonusService {
  constructor(private readonly db: BonusDatabaseClient) {}

  async createTemplate(input: CreateBonusTemplateInput, actor: ActorContext, requestId: string): Promise<BonusTemplate> {
    const existing = await this.db.bonusTemplate.findUnique({
      where: { tenantId_code: { tenantId: input.tenantId, code: input.code } }
    });
    if (existing) throw new BonusError("DUPLICATE_CODE", "Bonus template with this code already exists");

    const now = new Date().toISOString();
    return this.db.bonusTemplate.create({
      data: {
        id: crypto.randomUUID(),
        tenantId: input.tenantId,
        operatorId: input.operatorId,
        code: input.code.toUpperCase(),
        name: input.name,
        type: input.type,
        isActive: true,
        currency: input.currency.toUpperCase(),
        minDeposit: input.minDeposit,
        maxBonusAmount: input.maxBonusAmount,
        matchPercent: input.matchPercent,
        freeSpinCount: input.freeSpinCount,
        freeSpinValue: input.freeSpinValue,
        wageringMultiplier: input.wageringMultiplier ?? 35,
        expiryDays: input.expiryDays ?? 30,
        wageringContributions: input.wageringContributions ?? [{ scope: "all", contributionPercent: 100 }],
        eligibilityRules: input.eligibilityRules ?? [],
        createdAt: now,
        updatedAt: now
      }
    });
  }

  async grantBonus(input: GrantBonusInput, actor: ActorContext, requestId: string): Promise<BonusInstance> {
    const template = await this.db.bonusTemplate.findUnique({ where: { id: input.templateId } });
    if (!template?.isActive) throw new BonusError("TEMPLATE_NOT_FOUND", "Bonus template not found or inactive");

    // Check eligibility rules
    this.checkEligibility(template, input);

    // Calculate bonus amount
    const bonusAmount = this.calculateBonusAmount(template, input.depositAmount);
    const wageringRequired = (parseFloat(bonusAmount) * template.wageringMultiplier).toFixed(8);

    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + template.expiryDays * 86_400_000).toISOString();
    const instanceId = crypto.randomUUID();

    return this.db.$transaction(async (tx) => {
      const instance = await tx.bonusInstance.create({
        data: {
          id: instanceId,
          templateId: template.id,
          tenantId: input.tenantId,
          operatorId: input.operatorId,
          playerId: input.playerId,
          walletId: input.walletId,
          type: template.type,
          status: "active",
          currency: template.currency,
          bonusAmount,
          remainingAmount: bonusAmount,
          wageringRequired,
          wageringCompleted: "0.00000000",
          freeSpinCount: template.freeSpinCount,
          freeSpinsUsed: 0,
          expiresAt,
          activatedAt: now,
          createdAt: now,
          updatedAt: now
        }
      });

      await tx.bonusLedger.create({
        data: {
          id: crypto.randomUUID(),
          instanceId,
          tenantId: input.tenantId,
          playerId: input.playerId,
          type: "grant",
          amount: bonusAmount,
          postedAt: now
        }
      });

      const audit = createAuditEvent({ requestId, actor, action: "create", entityType: "BonusInstance", entityId: instanceId });
      await tx.auditLog.create({ data: { ...audit, tenantId: input.tenantId } });

      await tx.outboxEvent.create({
        data: {
          id: crypto.randomUUID(), tenantId: input.tenantId, name: "bonus.granted",
          aggregateType: "BonusInstance", aggregateId: instanceId,
          payload: { instanceId, playerId: input.playerId, amount: bonusAmount, type: template.type },
          schemaVersion: 1, status: "PENDING", attempts: 0, createdAt: now, updatedAt: now
        }
      });

      return instance;
    });
  }

  async recordWagering(input: RecordWageringInput): Promise<BonusInstance> {
    const instance = await this.db.bonusInstance.findUnique({ where: { id: input.instanceId } });
    if (!instance) throw new BonusError("NOT_FOUND", "Bonus instance not found");
    if (instance.status !== "active" && instance.status !== "wagering") {
      throw new BonusError("INVALID_STATE", "Bonus is not in a wagering state");
    }

    const template = await this.db.bonusTemplate.findUnique({ where: { id: instance.templateId } });
    const contribution = this.getWageringContribution(template, input.gameId, input.gameCategory);
    const contributionAmount = (parseFloat(input.betAmount) * contribution).toFixed(8);

    const newWageringCompleted = (parseFloat(instance.wageringCompleted) + parseFloat(contributionAmount)).toFixed(8);
    const isComplete = parseFloat(newWageringCompleted) >= parseFloat(instance.wageringRequired);
    const now = new Date().toISOString();

    return this.db.$transaction(async (tx) => {
      const updated = await tx.bonusInstance.update({
        where: { id: input.instanceId },
        data: {
          status: isComplete ? "completed" : "wagering",
          wageringCompleted: newWageringCompleted,
          completedAt: isComplete ? now : undefined,
          updatedAt: now
        }
      });

      await tx.bonusLedger.create({
        data: {
          id: crypto.randomUUID(),
          instanceId: input.instanceId,
          tenantId: instance.tenantId,
          playerId: instance.playerId,
          type: "wagering_contribution",
          amount: input.betAmount,
          wageringContribution: contributionAmount,
          gameId: input.gameId,
          betId: input.betId,
          postedAt: now
        }
      });

      if (isComplete) {
        await tx.outboxEvent.create({
          data: {
            id: crypto.randomUUID(), tenantId: instance.tenantId, name: "bonus.wagering_completed",
            aggregateType: "BonusInstance", aggregateId: input.instanceId,
            payload: { instanceId: input.instanceId, playerId: instance.playerId, amount: instance.bonusAmount },
            schemaVersion: 1, status: "PENDING", attempts: 0, createdAt: now, updatedAt: now
          }
        });
      }

      return updated;
    });
  }

  async listActiveByPlayer(playerId: string, tenantId: string): Promise<BonusInstance[]> {
    return this.db.bonusInstance.findMany({
      where: { playerId, tenantId, status: { in: ["active", "wagering"] } as unknown as string }
    });
  }

  private checkEligibility(template: BonusTemplate, input: GrantBonusInput): void {
    for (const rule of template.eligibilityRules) {
      if (rule.type === "min_deposit" && input.depositAmount) {
        if (parseFloat(input.depositAmount) < parseFloat(String(rule.value))) {
          throw new BonusError("ELIGIBILITY_FAILED", `Minimum deposit of ${rule.value} ${template.currency} required`);
        }
      }
    }
  }

  private calculateBonusAmount(template: BonusTemplate, depositAmount?: string): string {
    if (template.type === "deposit_match" && depositAmount && template.matchPercent) {
      const bonus = (parseFloat(depositAmount) * template.matchPercent) / 100;
      const maxBonus = template.maxBonusAmount ? parseFloat(template.maxBonusAmount) : Infinity;
      return Math.min(bonus, maxBonus).toFixed(8);
    }
    if (template.type === "free_spins" && template.freeSpinCount && template.freeSpinValue) {
      return (template.freeSpinCount * parseFloat(template.freeSpinValue)).toFixed(8);
    }
    return template.maxBonusAmount ?? "0.00000000";
  }

  private getWageringContribution(
    template: BonusTemplate | null,
    gameId: string,
    gameCategory: string
  ): number {
    if (!template) return 1;
    const contributions = template.wageringContributions;

    const specificGame = contributions.find((c) => c.scope === "specific_game" && c.gameId === gameId);
    if (specificGame) return specificGame.contributionPercent / 100;

    const categoryMap: Record<string, WageringContributionScope> = {
      slots: "slots", table: "table", live: "live", sports: "sports"
    };
    const scope = categoryMap[gameCategory.toLowerCase()];
    const byCat = scope ? contributions.find((c) => c.scope === scope) : undefined;
    if (byCat) return byCat.contributionPercent / 100;

    const allRule = contributions.find((c) => c.scope === "all");
    return allRule ? allRule.contributionPercent / 100 : 1;
  }
}
