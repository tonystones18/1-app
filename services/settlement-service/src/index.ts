// Settlement Service — Provider, Vendor, Operator, Agent, Affiliate Settlement Workflows

import type { ActorContext } from "@visionesoft/shared-types";
import { createAuditEvent } from "@visionesoft/audit";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SettlementPartyType = "provider" | "vendor" | "operator" | "agent" | "affiliate";
export type SettlementStatus = "calculating" | "draft" | "pending_review" | "approved" | "processing" | "completed" | "disputed" | "voided";
export type SettlementModel = "revenue_share" | "fixed_fee" | "hybrid" | "manual";

export interface SettlementCycle {
  id: string;
  tenantId: string;
  partyType: SettlementPartyType;
  partyId: string;
  periodStart: string;
  periodEnd: string;
  status: SettlementStatus;
  currency: string;
  grossRevenue: string;
  deductions: string;
  netAmount: string;
  settlementModel: SettlementModel;
  revenueSharePercent?: number;
  lines: SettlementLine[];
  approvedBy?: string;
  approvedAt?: string;
  processedAt?: string;
  bankReference?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SettlementLine {
  id: string;
  settlementId: string;
  description: string;
  type: "revenue" | "deduction" | "fee" | "adjustment" | "bonus_cost";
  amount: string;
  currency: string;
  period?: string;
}

export interface SettlementAdjustment {
  id: string;
  settlementId: string;
  tenantId: string;
  description: string;
  amount: string;
  direction: "increase" | "decrease";
  requestedBy: string;
  approvedBy?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

// ─── Inputs ────────────────────────────────────────────────────────────────

export interface CreateSettlementCycleInput {
  tenantId: string;
  partyType: SettlementPartyType;
  partyId: string;
  periodStart: string;
  periodEnd: string;
  currency: string;
  settlementModel: SettlementModel;
  revenueSharePercent?: number;
  grossRevenue: string;
  deductions?: string;
  lines?: Omit<SettlementLine, "id" | "settlementId">[];
  notes?: string;
}

export interface ApproveSettlementInput {
  settlementId: string;
  approvedBy: string;
}

export interface ProcessSettlementInput {
  settlementId: string;
  bankReference: string;
}

export interface RequestAdjustmentInput {
  settlementId: string;
  tenantId: string;
  description: string;
  amount: string;
  direction: SettlementAdjustment["direction"];
  requestedBy: string;
}

// ─── DB Client ────────────────────────────────────────────────────────────────

export interface SettlementDatabaseClient {
  settlementCycle: {
    findUnique(args: { where: { id: string } }): Promise<SettlementCycle | null>;
    findMany(args: { where: Record<string, unknown>; orderBy?: Record<string, unknown>; take?: number }): Promise<SettlementCycle[]>;
    create(args: { data: SettlementCycle }): Promise<SettlementCycle>;
    update(args: { where: { id: string }; data: Partial<SettlementCycle> }): Promise<SettlementCycle>;
  };
  settlementAdjustment: {
    create(args: { data: SettlementAdjustment }): Promise<SettlementAdjustment>;
    findMany(args: { where: Record<string, unknown> }): Promise<SettlementAdjustment[]>;
    update(args: { where: { id: string }; data: Partial<SettlementAdjustment> }): Promise<SettlementAdjustment>;
  };
  auditLog: { create(args: { data: Record<string, unknown> }): Promise<void> };
  outboxEvent: { create(args: { data: Record<string, unknown> }): Promise<void> };
  $transaction<T>(fn: (tx: SettlementDatabaseClient) => Promise<T>): Promise<T>;
}

// ─── Settlement Service ───────────────────────────────────────────────────────

export class SettlementService {
  constructor(private readonly db: SettlementDatabaseClient) {}

  async createCycle(input: CreateSettlementCycleInput, actor: ActorContext, requestId: string): Promise<SettlementCycle> {
    const netAmount = (parseFloat(input.grossRevenue) - parseFloat(input.deductions ?? "0")).toFixed(2);
    const now = new Date().toISOString();
    const settlementId = crypto.randomUUID();

    return this.db.$transaction(async (tx) => {
      const cycle = await tx.settlementCycle.create({
        data: {
          id: settlementId,
          tenantId: input.tenantId,
          partyType: input.partyType,
          partyId: input.partyId,
          periodStart: input.periodStart,
          periodEnd: input.periodEnd,
          status: "draft",
          currency: input.currency.toUpperCase(),
          grossRevenue: input.grossRevenue,
          deductions: input.deductions ?? "0.00",
          netAmount,
          settlementModel: input.settlementModel,
          revenueSharePercent: input.revenueSharePercent,
          lines: (input.lines ?? []).map((l) => ({ ...l, id: crypto.randomUUID(), settlementId })),
          notes: input.notes,
          createdAt: now,
          updatedAt: now
        }
      });

      const audit = createAuditEvent({ requestId, actor, action: "create", entityType: "SettlementCycle", entityId: settlementId });
      await tx.auditLog.create({ data: { ...audit, tenantId: input.tenantId } });
      return cycle;
    });
  }

  async approveCycle(input: ApproveSettlementInput, actor: ActorContext, requestId: string): Promise<SettlementCycle> {
    const cycle = await this.db.settlementCycle.findUnique({ where: { id: input.settlementId } });
    if (!cycle) throw new Error("Settlement cycle not found");
    if (!["draft", "pending_review"].includes(cycle.status)) throw new Error(`Cannot approve settlement in ${cycle.status} status`);

    const now = new Date().toISOString();
    return this.db.$transaction(async (tx) => {
      const updated = await tx.settlementCycle.update({
        where: { id: input.settlementId },
        data: { status: "approved", approvedBy: input.approvedBy, approvedAt: now, updatedAt: now }
      });

      const audit = createAuditEvent({ requestId, actor, action: "approve", entityType: "SettlementCycle", entityId: input.settlementId });
      await tx.auditLog.create({ data: { ...audit, tenantId: cycle.tenantId } });

      await tx.outboxEvent.create({
        data: {
          id: crypto.randomUUID(), tenantId: cycle.tenantId, name: "settlement.approved",
          aggregateType: "SettlementCycle", aggregateId: input.settlementId,
          payload: { settlementId: input.settlementId, partyType: cycle.partyType, partyId: cycle.partyId, amount: cycle.netAmount },
          schemaVersion: 1, status: "PENDING", attempts: 0, createdAt: now, updatedAt: now
        }
      });

      return updated;
    });
  }

  async processCycle(input: ProcessSettlementInput, actor: ActorContext, requestId: string): Promise<SettlementCycle> {
    const cycle = await this.db.settlementCycle.findUnique({ where: { id: input.settlementId } });
    if (!cycle) throw new Error("Settlement cycle not found");
    if (cycle.status !== "approved") throw new Error("Settlement must be approved before processing");

    const now = new Date().toISOString();
    return this.db.$transaction(async (tx) => {
      const updated = await tx.settlementCycle.update({
        where: { id: input.settlementId },
        data: { status: "completed", bankReference: input.bankReference, processedAt: now, updatedAt: now }
      });

      const audit = createAuditEvent({ requestId, actor, action: "update", entityType: "SettlementCycle", entityId: input.settlementId, diff: { status: "completed" } });
      await tx.auditLog.create({ data: { ...audit, tenantId: cycle.tenantId } });
      return updated;
    });
  }

  async listByParty(tenantId: string, partyType: SettlementPartyType, partyId: string): Promise<SettlementCycle[]> {
    return this.db.settlementCycle.findMany({
      where: { tenantId, partyType, partyId },
      orderBy: { periodEnd: "desc" } as Record<string, unknown>,
      take: 50
    });
  }

  async listPending(tenantId: string): Promise<SettlementCycle[]> {
    return this.db.settlementCycle.findMany({
      where: { tenantId, status: { in: ["draft", "pending_review"] } as unknown as string },
      orderBy: { periodEnd: "asc" } as Record<string, unknown>
    });
  }
}
