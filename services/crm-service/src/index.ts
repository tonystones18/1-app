// CRM Service — B2B Operator CRM Accounts, Contacts, Activities, Opportunities

import type { ActorContext } from "@visionesoft/shared-types";
import { createAuditEvent } from "@visionesoft/audit";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CrmAccountStatus = "prospect" | "onboarding" | "active" | "at_risk" | "churned" | "suspended";
export type CrmActivityType = "call" | "email" | "meeting" | "note" | "task" | "demo" | "proposal";
export type OpportunityStage = "initial_contact" | "qualification" | "proposal" | "negotiation" | "won" | "lost";

export interface CrmAccount {
  id: string;
  tenantId: string;
  operatorId?: string;
  companyName: string;
  legalName?: string;
  website?: string;
  country: string;
  status: CrmAccountStatus;
  assignedTo?: string;
  contractValue?: string;
  currency?: string;
  tags: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CrmContact {
  id: string;
  accountId: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  email: string;
  title?: string;
  phone?: string;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CrmActivity {
  id: string;
  accountId: string;
  tenantId: string;
  type: CrmActivityType;
  subject: string;
  description?: string;
  outcome?: string;
  scheduledAt?: string;
  completedAt?: string;
  dueAt?: string;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
}

export interface CrmOpportunity {
  id: string;
  accountId: string;
  tenantId: string;
  name: string;
  stage: OpportunityStage;
  value?: string;
  currency?: string;
  probability?: number;
  expectedCloseAt?: string;
  closedAt?: string;
  lostReason?: string;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Inputs ────────────────────────────────────────────────────────────────

export interface CreateCrmAccountInput {
  tenantId: string;
  operatorId?: string;
  companyName: string;
  legalName?: string;
  website?: string;
  country: string;
  assignedTo?: string;
  contractValue?: string;
  currency?: string;
  tags?: string[];
}

export interface LogActivityInput {
  accountId: string;
  tenantId: string;
  type: CrmActivityType;
  subject: string;
  description?: string;
  outcome?: string;
  scheduledAt?: string;
  dueAt?: string;
  assignedTo: string;
}

export interface CreateOpportunityInput {
  accountId: string;
  tenantId: string;
  name: string;
  value?: string;
  currency?: string;
  probability?: number;
  expectedCloseAt?: string;
  assignedTo: string;
}

export interface UpdateOpportunityStageInput {
  stage: OpportunityStage;
  probability?: number;
  lostReason?: string;
}

// ─── DB Client ────────────────────────────────────────────────────────────────

export interface CrmDatabaseClient {
  crmAccount: {
    findUnique(args: { where: { id: string } }): Promise<CrmAccount | null>;
    findMany(args: { where: Record<string, unknown>; orderBy?: Record<string, unknown>; take?: number }): Promise<CrmAccount[]>;
    create(args: { data: CrmAccount }): Promise<CrmAccount>;
    update(args: { where: { id: string }; data: Partial<CrmAccount> }): Promise<CrmAccount>;
  };
  crmContact: {
    findMany(args: { where: Record<string, unknown> }): Promise<CrmContact[]>;
    create(args: { data: CrmContact }): Promise<CrmContact>;
    update(args: { where: { id: string }; data: Partial<CrmContact> }): Promise<CrmContact>;
  };
  crmActivity: {
    findMany(args: { where: Record<string, unknown>; orderBy?: Record<string, unknown> }): Promise<CrmActivity[]>;
    create(args: { data: CrmActivity }): Promise<CrmActivity>;
  };
  crmOpportunity: {
    findUnique(args: { where: { id: string } }): Promise<CrmOpportunity | null>;
    findMany(args: { where: Record<string, unknown>; orderBy?: Record<string, unknown> }): Promise<CrmOpportunity[]>;
    create(args: { data: CrmOpportunity }): Promise<CrmOpportunity>;
    update(args: { where: { id: string }; data: Partial<CrmOpportunity> }): Promise<CrmOpportunity>;
  };
  auditLog: { create(args: { data: Record<string, unknown> }): Promise<void> };
  $transaction<T>(fn: (tx: CrmDatabaseClient) => Promise<T>): Promise<T>;
}

// ─── CRM Service ──────────────────────────────────────────────────────────────

export class CrmService {
  constructor(private readonly db: CrmDatabaseClient) {}

  async createAccount(input: CreateCrmAccountInput, actor: ActorContext, requestId: string): Promise<CrmAccount> {
    const now = new Date().toISOString();
    return this.db.$transaction(async (tx) => {
      const account = await tx.crmAccount.create({
        data: {
          id: crypto.randomUUID(),
          tenantId: input.tenantId,
          operatorId: input.operatorId,
          companyName: input.companyName,
          legalName: input.legalName,
          website: input.website,
          country: input.country,
          status: "prospect",
          assignedTo: input.assignedTo,
          contractValue: input.contractValue,
          currency: input.currency,
          tags: input.tags ?? [],
          createdAt: now,
          updatedAt: now
        }
      });
      const audit = createAuditEvent({ requestId, actor, action: "create", entityType: "CrmAccount", entityId: account.id });
      await tx.auditLog.create({ data: { ...audit, tenantId: input.tenantId } });
      return account;
    });
  }

  async updateAccountStatus(id: string, status: CrmAccountStatus, actor: ActorContext, requestId: string): Promise<CrmAccount> {
    const account = await this.db.crmAccount.findUnique({ where: { id } });
    if (!account) throw new Error("CRM account not found");
    const now = new Date().toISOString();
    return this.db.$transaction(async (tx) => {
      const updated = await tx.crmAccount.update({ where: { id }, data: { status, updatedAt: now } });
      const audit = createAuditEvent({ requestId, actor, action: "update", entityType: "CrmAccount", entityId: id, diff: { status } });
      await tx.auditLog.create({ data: { ...audit, tenantId: account.tenantId } });
      return updated;
    });
  }

  async logActivity(input: LogActivityInput, actor: ActorContext): Promise<CrmActivity> {
    const now = new Date().toISOString();
    return this.db.crmActivity.create({
      data: {
        id: crypto.randomUUID(),
        accountId: input.accountId,
        tenantId: input.tenantId,
        type: input.type,
        subject: input.subject,
        description: input.description,
        outcome: input.outcome,
        scheduledAt: input.scheduledAt,
        dueAt: input.dueAt,
        assignedTo: input.assignedTo,
        createdAt: now,
        updatedAt: now
      }
    });
  }

  async createOpportunity(input: CreateOpportunityInput, actor: ActorContext, requestId: string): Promise<CrmOpportunity> {
    const now = new Date().toISOString();
    return this.db.crmOpportunity.create({
      data: {
        id: crypto.randomUUID(),
        accountId: input.accountId,
        tenantId: input.tenantId,
        name: input.name,
        stage: "initial_contact",
        value: input.value,
        currency: input.currency,
        probability: input.probability ?? 10,
        expectedCloseAt: input.expectedCloseAt,
        assignedTo: input.assignedTo,
        createdAt: now,
        updatedAt: now
      }
    });
  }

  async updateOpportunityStage(id: string, input: UpdateOpportunityStageInput, actor: ActorContext, requestId: string): Promise<CrmOpportunity> {
    const opp = await this.db.crmOpportunity.findUnique({ where: { id } });
    if (!opp) throw new Error("Opportunity not found");
    const now = new Date().toISOString();
    const isClosed = ["won", "lost"].includes(input.stage);
    return this.db.crmOpportunity.update({
      where: { id },
      data: {
        stage: input.stage,
        probability: input.probability,
        lostReason: input.lostReason,
        closedAt: isClosed ? now : undefined,
        updatedAt: now
      }
    });
  }

  async listAccounts(tenantId: string, status?: CrmAccountStatus, limit = 50): Promise<CrmAccount[]> {
    const where: Record<string, unknown> = { tenantId };
    if (status) where["status"] = status;
    return this.db.crmAccount.findMany({ where, orderBy: { updatedAt: "desc" } as Record<string, unknown>, take: limit });
  }

  async getAccountActivities(accountId: string): Promise<CrmActivity[]> {
    return this.db.crmActivity.findMany({
      where: { accountId },
      orderBy: { createdAt: "desc" } as Record<string, unknown>
    });
  }
}
