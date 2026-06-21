// Compliance Service — KYC Cases, AML, RG Limits, Self-Exclusion

import type { ActorContext } from "@visionesoft/shared-types";
import { createAuditEvent } from "@visionesoft/audit";
import type { KycCheckType, KycCheckStatus } from "@visionesoft/compliance-adapters";

// ─── KYC ─────────────────────────────────────────────────────────────────────

export type KycCaseStatus =
  | "open"
  | "in_review"
  | "passed"
  | "failed"
  | "escalated"
  | "closed";

export interface KycCase {
  id: string;
  playerId: string;
  tenantId: string;
  operatorId: string;
  status: KycCaseStatus;
  level: "basic" | "enhanced" | "pep_sanctions";
  assignedTo?: string;
  notes?: string;
  riskScore?: number;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface KycDocument {
  id: string;
  caseId: string;
  playerId: string;
  tenantId: string;
  type: string;
  status: KycCheckStatus;
  fileKey: string;
  vendorReference?: string;
  vendorResult?: Record<string, unknown>;
  reviewedBy?: string;
  rejectionReason?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── AML ─────────────────────────────────────────────────────────────────────

export type AmlAlertStatus = "open" | "under_review" | "dismissed" | "escalated" | "reported";

export interface AmlAlert {
  id: string;
  playerId: string;
  tenantId: string;
  operatorId: string;
  triggerType: string;
  description: string;
  amount?: string;
  currency?: string;
  status: AmlAlertStatus;
  riskScore: number;
  assignedTo?: string;
  resolution?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Responsible Gaming ───────────────────────────────────────────────────────

export type RgLimitType = "deposit" | "loss" | "wager" | "session" | "cooldown";
export type RgLimitPeriod = "daily" | "weekly" | "monthly" | "session";

export interface ResponsibleGamingLimit {
  id: string;
  playerId: string;
  tenantId: string;
  operatorId: string;
  type: RgLimitType;
  period?: RgLimitPeriod;
  amount?: string;
  currency?: string;
  durationMinutes?: number;
  isActive: boolean;
  pendingAmount?: string;
  pendingApplicableAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SelfExclusion {
  id: string;
  playerId: string;
  tenantId: string;
  operatorId?: string;
  scope: "operator" | "global";
  type: "temporary" | "permanent";
  durationDays?: number;
  expiresAt?: string;
  reason?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Inputs ────────────────────────────────────────────────────────────────

export interface CreateKycCaseInput {
  playerId: string;
  tenantId: string;
  operatorId: string;
  level: KycCase["level"];
}

export interface UpdateKycCaseInput {
  status: KycCaseStatus;
  notes?: string;
  riskScore?: number;
}

export interface SetRgLimitInput {
  playerId: string;
  tenantId: string;
  operatorId: string;
  type: RgLimitType;
  period?: RgLimitPeriod;
  amount?: string;
  currency?: string;
  durationMinutes?: number;
}

export interface CreateSelfExclusionInput {
  playerId: string;
  tenantId: string;
  operatorId?: string;
  scope: SelfExclusion["scope"];
  type: SelfExclusion["type"];
  durationDays?: number;
  reason?: string;
}

// ─── DB Client ────────────────────────────────────────────────────────────────

export interface ComplianceDatabaseClient {
  kycCase: {
    findUnique(args: { where: { id: string } | { playerId: string } }): Promise<KycCase | null>;
    findMany(args: { where: Record<string, unknown>; orderBy?: Record<string, unknown> }): Promise<KycCase[]>;
    create(args: { data: KycCase }): Promise<KycCase>;
    update(args: { where: { id: string }; data: Partial<KycCase> }): Promise<KycCase>;
  };
  kycDocument: {
    findMany(args: { where: Record<string, unknown> }): Promise<KycDocument[]>;
    create(args: { data: KycDocument }): Promise<KycDocument>;
    update(args: { where: { id: string }; data: Partial<KycDocument> }): Promise<KycDocument>;
  };
  amlAlert: {
    findMany(args: { where: Record<string, unknown>; orderBy?: Record<string, unknown> }): Promise<AmlAlert[]>;
    create(args: { data: AmlAlert }): Promise<AmlAlert>;
    update(args: { where: { id: string }; data: Partial<AmlAlert> }): Promise<AmlAlert>;
  };
  responsibleGamingLimit: {
    findMany(args: { where: Record<string, unknown> }): Promise<ResponsibleGamingLimit[]>;
    create(args: { data: ResponsibleGamingLimit }): Promise<ResponsibleGamingLimit>;
    update(args: { where: { id: string }; data: Partial<ResponsibleGamingLimit> }): Promise<ResponsibleGamingLimit>;
  };
  selfExclusion: {
    findMany(args: { where: Record<string, unknown> }): Promise<SelfExclusion[]>;
    create(args: { data: SelfExclusion }): Promise<SelfExclusion>;
    update(args: { where: { id: string }; data: Partial<SelfExclusion> }): Promise<SelfExclusion>;
  };
  auditLog: { create(args: { data: Record<string, unknown> }): Promise<void> };
  outboxEvent: { create(args: { data: Record<string, unknown> }): Promise<void> };
  $transaction<T>(fn: (tx: ComplianceDatabaseClient) => Promise<T>): Promise<T>;
}

// ─── Compliance Service ───────────────────────────────────────────────────────

export class ComplianceService {
  constructor(private readonly db: ComplianceDatabaseClient) {}

  async createKycCase(input: CreateKycCaseInput, actor: ActorContext, requestId: string): Promise<KycCase> {
    const now = new Date().toISOString();
    return this.db.$transaction(async (tx) => {
      const kycCase = await tx.kycCase.create({
        data: {
          id: crypto.randomUUID(),
          playerId: input.playerId,
          tenantId: input.tenantId,
          operatorId: input.operatorId,
          status: "open",
          level: input.level,
          createdAt: now,
          updatedAt: now
        }
      });

      const audit = createAuditEvent({ requestId, actor, action: "create", entityType: "KycCase", entityId: kycCase.id });
      await tx.auditLog.create({ data: { ...audit, tenantId: input.tenantId } });

      await tx.outboxEvent.create({
        data: {
          id: crypto.randomUUID(), tenantId: input.tenantId, name: "compliance.kyc_case_opened",
          aggregateType: "KycCase", aggregateId: kycCase.id,
          payload: { caseId: kycCase.id, playerId: input.playerId, level: input.level },
          schemaVersion: 1, status: "PENDING", attempts: 0, createdAt: now, updatedAt: now
        }
      });

      return kycCase;
    });
  }

  async updateKycCase(id: string, input: UpdateKycCaseInput, actor: ActorContext, requestId: string): Promise<KycCase> {
    const kycCase = await this.db.kycCase.findUnique({ where: { id } });
    if (!kycCase) throw new Error("KYC case not found");

    const now = new Date().toISOString();
    return this.db.$transaction(async (tx) => {
      const updated = await tx.kycCase.update({
        where: { id },
        data: { ...input, completedAt: ["passed", "failed", "closed"].includes(input.status) ? now : undefined, updatedAt: now }
      });

      const audit = createAuditEvent({ requestId, actor, action: "update", entityType: "KycCase", entityId: id, diff: input as unknown as Record<string, unknown> });
      await tx.auditLog.create({ data: { ...audit, tenantId: kycCase.tenantId } });

      if (input.status === "passed" || input.status === "failed") {
        await tx.outboxEvent.create({
          data: {
            id: crypto.randomUUID(), tenantId: kycCase.tenantId, name: `compliance.kyc_${input.status}`,
            aggregateType: "KycCase", aggregateId: id,
            payload: { caseId: id, playerId: kycCase.playerId, status: input.status },
            schemaVersion: 1, status: "PENDING", attempts: 0, createdAt: now, updatedAt: now
          }
        });
      }

      return updated;
    });
  }

  async setRgLimit(input: SetRgLimitInput, actor: ActorContext, requestId: string): Promise<ResponsibleGamingLimit> {
    const now = new Date().toISOString();
    // Find and deactivate existing limit of same type/period
    const existing = await this.db.responsibleGamingLimit.findMany({
      where: { playerId: input.playerId, tenantId: input.tenantId, type: input.type, period: input.period, isActive: true }
    });

    return this.db.$transaction(async (tx) => {
      // Deactivate existing limits of same type
      for (const limit of existing) {
        await tx.responsibleGamingLimit.update({ where: { id: limit.id }, data: { isActive: false, updatedAt: now } });
      }

      const limit = await tx.responsibleGamingLimit.create({
        data: {
          id: crypto.randomUUID(),
          playerId: input.playerId,
          tenantId: input.tenantId,
          operatorId: input.operatorId,
          type: input.type,
          period: input.period,
          amount: input.amount,
          currency: input.currency,
          durationMinutes: input.durationMinutes,
          isActive: true,
          createdAt: now,
          updatedAt: now
        }
      });

      const audit = createAuditEvent({ requestId, actor, action: "create", entityType: "RgLimit", entityId: limit.id });
      await tx.auditLog.create({ data: { ...audit, tenantId: input.tenantId } });

      await tx.outboxEvent.create({
        data: {
          id: crypto.randomUUID(), tenantId: input.tenantId, name: "compliance.rg_limit_set",
          aggregateType: "Player", aggregateId: input.playerId,
          payload: { playerId: input.playerId, limitId: limit.id, type: input.type, period: input.period },
          schemaVersion: 1, status: "PENDING", attempts: 0, createdAt: now, updatedAt: now
        }
      });

      return limit;
    });
  }

  async selfExclude(input: CreateSelfExclusionInput, actor: ActorContext, requestId: string): Promise<SelfExclusion> {
    const now = new Date().toISOString();
    const expiresAt = input.durationDays
      ? new Date(Date.now() + input.durationDays * 86_400_000).toISOString()
      : undefined;

    return this.db.$transaction(async (tx) => {
      const exclusion = await tx.selfExclusion.create({
        data: {
          id: crypto.randomUUID(),
          playerId: input.playerId,
          tenantId: input.tenantId,
          operatorId: input.operatorId,
          scope: input.scope,
          type: input.type,
          durationDays: input.durationDays,
          expiresAt,
          reason: input.reason,
          isActive: true,
          createdAt: now,
          updatedAt: now
        }
      });

      const audit = createAuditEvent({ requestId, actor, action: "create", entityType: "SelfExclusion", entityId: exclusion.id });
      await tx.auditLog.create({ data: { ...audit, tenantId: input.tenantId } });

      await tx.outboxEvent.create({
        data: {
          id: crypto.randomUUID(), tenantId: input.tenantId, name: "compliance.self_exclusion_activated",
          aggregateType: "Player", aggregateId: input.playerId,
          payload: { playerId: input.playerId, exclusionId: exclusion.id, type: input.type, scope: input.scope },
          schemaVersion: 1, status: "PENDING", attempts: 0, createdAt: now, updatedAt: now
        }
      });

      return exclusion;
    });
  }

  async getPlayerLimits(playerId: string, tenantId: string): Promise<ResponsibleGamingLimit[]> {
    return this.db.responsibleGamingLimit.findMany({ where: { playerId, tenantId, isActive: true } });
  }

  async getActiveSelfExclusions(playerId: string, tenantId: string): Promise<SelfExclusion[]> {
    return this.db.selfExclusion.findMany({ where: { playerId, tenantId, isActive: true } });
  }

  async listAmlAlerts(tenantId: string, playerId?: string): Promise<AmlAlert[]> {
    const where: Record<string, unknown> = { tenantId, status: "open" };
    if (playerId) where["playerId"] = playerId;
    return this.db.amlAlert.findMany({ where, orderBy: { createdAt: "desc" } as Record<string, unknown> });
  }
}
