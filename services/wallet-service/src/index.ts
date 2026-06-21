// Wallet Service — Double-Entry Ledger and Wallet Management
// Implements: wallets, accounts (balance types), ledger entries, transactions, holds, adjustments

import type { ActorContext } from "@visionesoft/shared-types";
import { createAuditEvent } from "@visionesoft/audit";

// ─── Enums / Types ────────────────────────────────────────────────────────────

export type BalanceType = "cash" | "bonus" | "locked" | "pending_withdrawal" | "adjustment" | "promotional";

export type LedgerDirection = "debit" | "credit";

export type TransactionType =
  | "deposit"
  | "withdrawal"
  | "bet"
  | "win"
  | "bonus_grant"
  | "bonus_expiry"
  | "adjustment"
  | "hold"
  | "hold_release"
  | "rollback"
  | "fee"
  | "transfer_in"
  | "transfer_out";

export type TransactionStatus = "pending" | "completed" | "failed" | "reversed";

export type HoldStatus = "active" | "released" | "expired" | "converted";

// ─── Domain Records ────────────────────────────────────────────────────────────

export interface WalletRecord {
  id: string;
  tenantId: string;
  operatorId: string;
  playerId: string;
  currency: string;
  cashBalance: string;
  bonusBalance: string;
  lockedBalance: string;
  pendingWithdrawalBalance: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LedgerEntry {
  id: string;
  walletId: string;
  tenantId: string;
  operatorId: string;
  playerId: string;
  transactionId: string;
  balanceType: BalanceType;
  direction: LedgerDirection;
  amount: string;
  currency: string;
  runningBalance: string;
  sourceType: string;
  sourceId: string;
  idempotencyKey: string;
  metadata?: Record<string, unknown>;
  postedAt: string;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  tenantId: string;
  operatorId: string;
  playerId: string;
  type: TransactionType;
  status: TransactionStatus;
  currency: string;
  amount: string;
  balanceType: BalanceType;
  idempotencyKey: string;
  sourceType?: string;
  sourceId?: string;
  reversesTransactionId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface WalletHold {
  id: string;
  walletId: string;
  tenantId: string;
  playerId: string;
  currency: string;
  amount: string;
  status: HoldStatus;
  reason: string;
  expiresAt?: string;
  releasedAt?: string;
  createdAt: string;
}

// ─── Inputs / DTOs ────────────────────────────────────────────────────────────

export interface CreateWalletInput {
  tenantId: string;
  operatorId: string;
  playerId: string;
  currency: string;
}

export interface PostTransactionInput {
  walletId: string;
  type: TransactionType;
  amount: string;
  balanceType: BalanceType;
  idempotencyKey: string;
  sourceType?: string;
  sourceId?: string;
  metadata?: Record<string, unknown>;
}

export interface PlaceHoldInput {
  walletId: string;
  amount: string;
  reason: string;
  expiresAt?: string;
}

export interface ReleaseHoldInput {
  holdId: string;
  convertToWithdrawal?: boolean;
}

export interface WalletAdjustmentInput {
  walletId: string;
  amount: string;
  direction: LedgerDirection;
  balanceType: BalanceType;
  reason: string;
  idempotencyKey: string;
}

// ─── Balance Arithmetic (string-based to avoid float precision) ───────────────

function addAmounts(a: string, b: string): string {
  // Use integer arithmetic in minor units (e.g. cents) for precision
  const decimals = 8;
  const factor = 10 ** decimals;
  const aInt = Math.round(parseFloat(a) * factor);
  const bInt = Math.round(parseFloat(b) * factor);
  return ((aInt + bInt) / factor).toFixed(8);
}

function subtractAmounts(a: string, b: string): string {
  const decimals = 8;
  const factor = 10 ** decimals;
  const aInt = Math.round(parseFloat(a) * factor);
  const bInt = Math.round(parseFloat(b) * factor);
  return ((aInt - bInt) / factor).toFixed(8);
}

function isNegative(a: string): boolean {
  return parseFloat(a) < 0;
}

function isPositive(a: string): boolean {
  return parseFloat(a) > 0;
}

// ─── Validation ───────────────────────────────────────────────────────────────

export class WalletError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message);
    this.name = "WalletError";
  }
}

export function validateAmount(amount: string): void {
  const num = parseFloat(amount);
  if (isNaN(num) || num <= 0) {
    throw new WalletError("INVALID_AMOUNT", "Amount must be a positive number");
  }
}

// ─── Database Client Interface ────────────────────────────────────────────────

export interface WalletDatabaseClient {
  wallet: {
    findUnique(args: { where: { id: string } | { playerId_currency: { playerId: string; currency: string } } }): Promise<WalletRecord | null>;
    create(args: { data: WalletRecord }): Promise<WalletRecord>;
    update(args: { where: { id: string }; data: Partial<WalletRecord> }): Promise<WalletRecord>;
  };
  ledgerEntry: {
    create(args: { data: LedgerEntry }): Promise<LedgerEntry>;
    findMany(args: { where: Record<string, unknown>; orderBy?: Record<string, unknown>; take?: number }): Promise<LedgerEntry[]>;
  };
  walletTransaction: {
    findUnique(args: { where: { idempotencyKey: string } }): Promise<WalletTransaction | null>;
    create(args: { data: WalletTransaction }): Promise<WalletTransaction>;
    update(args: { where: { id: string }; data: Partial<WalletTransaction> }): Promise<WalletTransaction>;
  };
  walletHold: {
    findUnique(args: { where: { id: string } }): Promise<WalletHold | null>;
    findMany(args: { where: Record<string, unknown> }): Promise<WalletHold[]>;
    create(args: { data: WalletHold }): Promise<WalletHold>;
    update(args: { where: { id: string }; data: Partial<WalletHold> }): Promise<WalletHold>;
  };
  auditLog: {
    create(args: { data: Record<string, unknown> }): Promise<void>;
  };
  outboxEvent: {
    create(args: { data: Record<string, unknown> }): Promise<void>;
  };
  $transaction<T>(fn: (tx: WalletDatabaseClient) => Promise<T>): Promise<T>;
}

// ─── Wallet Repository ────────────────────────────────────────────────────────

export class WalletRepository {
  constructor(private readonly db: WalletDatabaseClient) {}

  async getById(id: string): Promise<WalletRecord | null> {
    return this.db.wallet.findUnique({ where: { id } });
  }

  async getByPlayer(playerId: string, currency: string): Promise<WalletRecord | null> {
    return this.db.wallet.findUnique({ where: { playerId_currency: { playerId, currency } } });
  }

  async create(input: CreateWalletInput): Promise<WalletRecord> {
    const now = new Date().toISOString();
    const wallet: WalletRecord = {
      id: crypto.randomUUID(),
      tenantId: input.tenantId,
      operatorId: input.operatorId,
      playerId: input.playerId,
      currency: input.currency.toUpperCase(),
      cashBalance: "0.00000000",
      bonusBalance: "0.00000000",
      lockedBalance: "0.00000000",
      pendingWithdrawalBalance: "0.00000000",
      isActive: true,
      createdAt: now,
      updatedAt: now
    };
    return this.db.wallet.create({ data: wallet });
  }

  async postTransaction(
    input: PostTransactionInput,
    actor: ActorContext,
    requestId: string
  ): Promise<{ transaction: WalletTransaction; ledgerEntry: LedgerEntry }> {
    validateAmount(input.amount);

    // Idempotency check
    const existing = await this.db.walletTransaction.findUnique({
      where: { idempotencyKey: input.idempotencyKey }
    });
    if (existing) {
      throw new WalletError("DUPLICATE_TRANSACTION", "Transaction with this idempotency key already exists");
    }

    const wallet = await this.getById(input.walletId);
    if (!wallet) throw new WalletError("WALLET_NOT_FOUND", "Wallet not found");
    if (!wallet.isActive) throw new WalletError("WALLET_INACTIVE", "Wallet is not active");

    // Determine direction from transaction type
    const isCredit = ["deposit", "win", "bonus_grant", "hold_release", "transfer_in"].includes(input.type);
    const direction: LedgerDirection = isCredit ? "credit" : "debit";

    // Get current balance for the balance type
    const currentBalance = this.getBalance(wallet, input.balanceType);

    // Check sufficient funds for debits
    if (!isCredit && isNegative(subtractAmounts(currentBalance, input.amount))) {
      throw new WalletError("INSUFFICIENT_FUNDS", "Insufficient balance");
    }

    const newBalance = isCredit
      ? addAmounts(currentBalance, input.amount)
      : subtractAmounts(currentBalance, input.amount);

    const now = new Date().toISOString();
    const transactionId = crypto.randomUUID();
    const ledgerEntryId = crypto.randomUUID();

    return this.db.$transaction(async (tx) => {
      // Create transaction record
      const transaction = await tx.walletTransaction.create({
        data: {
          id: transactionId,
          walletId: input.walletId,
          tenantId: wallet.tenantId,
          operatorId: wallet.operatorId,
          playerId: wallet.playerId,
          type: input.type,
          status: "completed",
          currency: wallet.currency,
          amount: input.amount,
          balanceType: input.balanceType,
          idempotencyKey: input.idempotencyKey,
          sourceType: input.sourceType,
          sourceId: input.sourceId,
          metadata: input.metadata,
          createdAt: now,
          updatedAt: now
        }
      });

      // Post immutable ledger entry
      const ledgerEntry = await tx.ledgerEntry.create({
        data: {
          id: ledgerEntryId,
          walletId: input.walletId,
          tenantId: wallet.tenantId,
          operatorId: wallet.operatorId,
          playerId: wallet.playerId,
          transactionId,
          balanceType: input.balanceType,
          direction,
          amount: input.amount,
          currency: wallet.currency,
          runningBalance: newBalance,
          sourceType: input.sourceType ?? input.type,
          sourceId: input.sourceId ?? transactionId,
          idempotencyKey: input.idempotencyKey,
          metadata: input.metadata,
          postedAt: now
        }
      });

      // Update wallet balance
      const balanceUpdate: Partial<WalletRecord> = { updatedAt: now };
      switch (input.balanceType) {
        case "cash": balanceUpdate.cashBalance = newBalance; break;
        case "bonus": balanceUpdate.bonusBalance = newBalance; break;
        case "locked": balanceUpdate.lockedBalance = newBalance; break;
        case "pending_withdrawal": balanceUpdate.pendingWithdrawalBalance = newBalance; break;
      }
      await tx.wallet.update({ where: { id: input.walletId }, data: balanceUpdate });

      // Audit
      const audit = createAuditEvent({
        requestId,
        actor,
        action: "create",
        entityType: "WalletTransaction",
        entityId: transactionId,
        diff: { type: input.type, amount: input.amount, balanceType: input.balanceType }
      });
      await tx.auditLog.create({ data: { ...audit, tenantId: wallet.tenantId } });

      // Outbox
      await tx.outboxEvent.create({
        data: {
          id: crypto.randomUUID(),
          tenantId: wallet.tenantId,
          name: `wallet.${input.type}`,
          aggregateType: "Wallet",
          aggregateId: input.walletId,
          payload: { transactionId, playerId: wallet.playerId, amount: input.amount, type: input.type },
          schemaVersion: 1,
          status: "PENDING",
          attempts: 0,
          createdAt: now,
          updatedAt: now
        }
      });

      return { transaction, ledgerEntry };
    });
  }

  async getLedgerEntries(walletId: string, limit = 50): Promise<LedgerEntry[]> {
    return this.db.ledgerEntry.findMany({
      where: { walletId },
      orderBy: { postedAt: "desc" } as Record<string, unknown>,
      take: limit
    });
  }

  async placeHold(input: PlaceHoldInput, actor: ActorContext, requestId: string): Promise<WalletHold> {
    validateAmount(input.amount);
    const wallet = await this.getById(input.walletId);
    if (!wallet) throw new WalletError("WALLET_NOT_FOUND", "Wallet not found");

    if (isNegative(subtractAmounts(wallet.cashBalance, input.amount))) {
      throw new WalletError("INSUFFICIENT_FUNDS", "Insufficient cash balance to place hold");
    }

    const now = new Date().toISOString();

    return this.db.$transaction(async (tx) => {
      const hold = await tx.walletHold.create({
        data: {
          id: crypto.randomUUID(),
          walletId: input.walletId,
          tenantId: wallet.tenantId,
          playerId: wallet.playerId,
          currency: wallet.currency,
          amount: input.amount,
          status: "active",
          reason: input.reason,
          expiresAt: input.expiresAt,
          createdAt: now
        }
      });

      // Move funds from cash to locked
      await tx.wallet.update({
        where: { id: input.walletId },
        data: {
          cashBalance: subtractAmounts(wallet.cashBalance, input.amount),
          lockedBalance: addAmounts(wallet.lockedBalance, input.amount),
          updatedAt: now
        }
      });

      return hold;
    });
  }

  private getBalance(wallet: WalletRecord, balanceType: BalanceType): string {
    switch (balanceType) {
      case "cash": return wallet.cashBalance;
      case "bonus": return wallet.bonusBalance;
      case "locked": return wallet.lockedBalance;
      case "pending_withdrawal": return wallet.pendingWithdrawalBalance;
      default: return "0.00000000";
    }
  }
}
