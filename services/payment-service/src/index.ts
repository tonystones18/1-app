// Payment Service — Deposit and Withdrawal Workflows
// Covers: payment routing, PSP integration, callback processing, withdrawal approvals

import type { ActorContext } from "@visionesoft/shared-types";
import { createAuditEvent } from "@visionesoft/audit";
import type { PaymentAdapter, PaymentMethod } from "@visionesoft/payment-adapters";

// ─── Enums / Types ────────────────────────────────────────────────────────────

export type PaymentDirection = "deposit" | "withdrawal";

export type PaymentStatus =
  | "pending"
  | "processing"
  | "requires_action"
  | "completed"
  | "failed"
  | "cancelled"
  | "reversed"
  | "chargeback";

export type WithdrawalApprovalStatus =
  | "pending_risk"
  | "pending_kyc"
  | "pending_approval"
  | "approved"
  | "rejected"
  | "processing"
  | "completed"
  | "failed";

// ─── Domain Records ────────────────────────────────────────────────────────────

export interface PaymentRecord {
  id: string;
  tenantId: string;
  operatorId: string;
  playerId: string;
  walletId: string;
  direction: PaymentDirection;
  method: PaymentMethod;
  currency: string;
  amount: string;
  fee: string;
  netAmount: string;
  status: PaymentStatus;
  pspCode: string;
  pspReference?: string;
  redirectUrl?: string;
  idempotencyKey: string;
  riskScore?: number;
  ipAddress?: string;
  country?: string;
  metadata?: Record<string, unknown>;
  completedAt?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WithdrawalApproval {
  id: string;
  paymentId: string;
  tenantId: string;
  operatorId: string;
  playerId: string;
  currency: string;
  amount: string;
  status: WithdrawalApprovalStatus;
  riskCheckPassed?: boolean;
  kycCheckPassed?: boolean;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentMethod2 {
  id: string;
  playerId: string;
  tenantId: string;
  method: PaymentMethod;
  pspCode: string;
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  holderName?: string;
  isDefault: boolean;
  isVerified: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// ─── Inputs ────────────────────────────────────────────────────────────────

export interface InitiateDepositInput {
  tenantId: string;
  operatorId: string;
  playerId: string;
  walletId: string;
  method: PaymentMethod;
  pspCode: string;
  currency: string;
  amount: string;
  idempotencyKey: string;
  returnUrl?: string;
  webhookUrl?: string;
  country?: string;
  ipAddress?: string;
  metadata?: Record<string, unknown>;
}

export interface InitiateWithdrawalInput {
  tenantId: string;
  operatorId: string;
  playerId: string;
  walletId: string;
  method: PaymentMethod;
  pspCode: string;
  currency: string;
  amount: string;
  idempotencyKey: string;
  country?: string;
  ipAddress?: string;
  metadata?: Record<string, unknown>;
}

export interface ApproveWithdrawalInput {
  withdrawalId: string;
  approvedBy: string;
}

export interface RejectWithdrawalInput {
  withdrawalId: string;
  rejectedBy: string;
  reason: string;
}

export interface ProcessPspCallbackInput {
  pspCode: string;
  paymentId?: string;
  pspReference: string;
  status: PaymentStatus;
  amount?: string;
  currency?: string;
  metadata?: Record<string, unknown>;
  rawBody: unknown;
  rawHeaders: Record<string, string>;
}

// ─── Validation ───────────────────────────────────────────────────────────────

export class PaymentError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message);
    this.name = "PaymentError";
  }
}

// ─── Database Client Interface ────────────────────────────────────────────────

export interface PaymentDatabaseClient {
  payment: {
    findUnique(args: { where: { id: string } | { idempotencyKey: string } }): Promise<PaymentRecord | null>;
    findMany(args: { where: Record<string, unknown>; orderBy?: Record<string, unknown>; take?: number }): Promise<PaymentRecord[]>;
    create(args: { data: PaymentRecord }): Promise<PaymentRecord>;
    update(args: { where: { id: string }; data: Partial<PaymentRecord> }): Promise<PaymentRecord>;
  };
  withdrawalApproval: {
    findUnique(args: { where: { id: string } | { paymentId: string } }): Promise<WithdrawalApproval | null>;
    create(args: { data: WithdrawalApproval }): Promise<WithdrawalApproval>;
    update(args: { where: { id: string }; data: Partial<WithdrawalApproval> }): Promise<WithdrawalApproval>;
  };
  auditLog: { create(args: { data: Record<string, unknown> }): Promise<void> };
  outboxEvent: { create(args: { data: Record<string, unknown> }): Promise<void> };
  $transaction<T>(fn: (tx: PaymentDatabaseClient) => Promise<T>): Promise<T>;
}

// ─── Payment Service ──────────────────────────────────────────────────────────

export class PaymentService {
  constructor(
    private readonly db: PaymentDatabaseClient,
    private readonly getAdapter: (pspCode: string) => PaymentAdapter
  ) {}

  async initiateDeposit(
    input: InitiateDepositInput,
    actor: ActorContext,
    requestId: string
  ): Promise<PaymentRecord> {
    const existing = await this.db.payment.findUnique({ where: { idempotencyKey: input.idempotencyKey } });
    if (existing) return existing;

    if (parseFloat(input.amount) <= 0) {
      throw new PaymentError("INVALID_AMOUNT", "Deposit amount must be positive");
    }

    const adapter = this.getAdapter(input.pspCode);
    const now = new Date().toISOString();
    const paymentId = crypto.randomUUID();

    const pspResult = await adapter.createPayment({
      operatorId: input.operatorId,
      playerId: input.playerId,
      externalReference: paymentId,
      direction: "deposit",
      method: input.method,
      currency: input.currency,
      amount: input.amount,
      country: input.country ?? "",
      returnUrl: input.returnUrl,
      webhookUrl: input.webhookUrl,
      metadata: input.metadata
    });

    return this.db.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          id: paymentId,
          tenantId: input.tenantId,
          operatorId: input.operatorId,
          playerId: input.playerId,
          walletId: input.walletId,
          direction: "deposit",
          method: input.method,
          currency: input.currency,
          amount: input.amount,
          fee: "0.00",
          netAmount: input.amount,
          status: pspResult.status as PaymentStatus,
          pspCode: input.pspCode,
          pspReference: pspResult.pspReference,
          redirectUrl: pspResult.redirectUrl,
          idempotencyKey: input.idempotencyKey,
          country: input.country,
          ipAddress: input.ipAddress,
          metadata: input.metadata,
          createdAt: now,
          updatedAt: now
        }
      });

      const audit = createAuditEvent({ requestId, actor, action: "create", entityType: "Payment", entityId: paymentId });
      await tx.auditLog.create({ data: { ...audit, tenantId: input.tenantId } });

      await tx.outboxEvent.create({
        data: {
          id: crypto.randomUUID(), tenantId: input.tenantId, name: "payment.deposit_initiated",
          aggregateType: "Payment", aggregateId: paymentId,
          payload: { paymentId, playerId: input.playerId, amount: input.amount, currency: input.currency },
          schemaVersion: 1, status: "PENDING", attempts: 0, createdAt: now, updatedAt: now
        }
      });

      return payment;
    });
  }

  async initiateWithdrawal(
    input: InitiateWithdrawalInput,
    actor: ActorContext,
    requestId: string
  ): Promise<{ payment: PaymentRecord; approval: WithdrawalApproval }> {
    const existing = await this.db.payment.findUnique({ where: { idempotencyKey: input.idempotencyKey } });
    if (existing) {
      const approval = await this.db.withdrawalApproval.findUnique({ where: { paymentId: existing.id } });
      return { payment: existing, approval: approval! };
    }

    if (parseFloat(input.amount) <= 0) {
      throw new PaymentError("INVALID_AMOUNT", "Withdrawal amount must be positive");
    }

    const now = new Date().toISOString();
    const paymentId = crypto.randomUUID();
    const approvalId = crypto.randomUUID();

    return this.db.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          id: paymentId, tenantId: input.tenantId, operatorId: input.operatorId,
          playerId: input.playerId, walletId: input.walletId,
          direction: "withdrawal", method: input.method, currency: input.currency,
          amount: input.amount, fee: "0.00", netAmount: input.amount,
          status: "pending", pspCode: input.pspCode,
          idempotencyKey: input.idempotencyKey,
          country: input.country, ipAddress: input.ipAddress,
          metadata: input.metadata, createdAt: now, updatedAt: now
        }
      });

      const approval = await tx.withdrawalApproval.create({
        data: {
          id: approvalId, paymentId, tenantId: input.tenantId,
          operatorId: input.operatorId, playerId: input.playerId,
          currency: input.currency, amount: input.amount,
          status: "pending_risk", createdAt: now, updatedAt: now
        }
      });

      const audit = createAuditEvent({ requestId, actor, action: "create", entityType: "WithdrawalRequest", entityId: paymentId });
      await tx.auditLog.create({ data: { ...audit, tenantId: input.tenantId } });

      await tx.outboxEvent.create({
        data: {
          id: crypto.randomUUID(), tenantId: input.tenantId, name: "payment.withdrawal_requested",
          aggregateType: "Payment", aggregateId: paymentId,
          payload: { paymentId, approvalId, playerId: input.playerId, amount: input.amount },
          schemaVersion: 1, status: "PENDING", attempts: 0, createdAt: now, updatedAt: now
        }
      });

      return { payment, approval };
    });
  }

  async approveWithdrawal(input: ApproveWithdrawalInput, actor: ActorContext, requestId: string): Promise<WithdrawalApproval> {
    const approval = await this.db.withdrawalApproval.findUnique({ where: { id: input.withdrawalId } });
    if (!approval) throw new PaymentError("NOT_FOUND", "Withdrawal approval not found");
    if (approval.status !== "pending_approval") {
      throw new PaymentError("INVALID_STATE", `Withdrawal is in ${approval.status} state, cannot approve`);
    }

    const now = new Date().toISOString();
    return this.db.$transaction(async (tx) => {
      const updated = await tx.withdrawalApproval.update({
        where: { id: input.withdrawalId },
        data: { status: "approved", approvedBy: input.approvedBy, approvedAt: now, updatedAt: now }
      });

      const audit = createAuditEvent({ requestId, actor, action: "approve", entityType: "WithdrawalApproval", entityId: input.withdrawalId });
      await tx.auditLog.create({ data: { ...audit, tenantId: approval.tenantId } });

      await tx.outboxEvent.create({
        data: {
          id: crypto.randomUUID(), tenantId: approval.tenantId, name: "payment.withdrawal_approved",
          aggregateType: "Payment", aggregateId: approval.paymentId,
          payload: { paymentId: approval.paymentId, approvedBy: input.approvedBy },
          schemaVersion: 1, status: "PENDING", attempts: 0, createdAt: now, updatedAt: now
        }
      });

      return updated;
    });
  }

  async listPayments(tenantId: string, playerId?: string, limit = 25): Promise<PaymentRecord[]> {
    const where: Record<string, unknown> = { tenantId };
    if (playerId) where["playerId"] = playerId;
    return this.db.payment.findMany({
      where,
      orderBy: { createdAt: "desc" } as Record<string, unknown>,
      take: limit
    });
  }
}
