// Billing Service — Invoices, Credit Notes, Billing Periods

import type { ActorContext } from "@visionesoft/shared-types";
import { createAuditEvent } from "@visionesoft/audit";

// ─── Types ────────────────────────────────────────────────────────────────────

export type InvoiceStatus = "draft" | "pending_review" | "approved" | "issued" | "paid" | "overdue" | "disputed" | "voided" | "written_off";
export type BillingPeriodStatus = "open" | "calculating" | "review" | "approved" | "closed";

export interface Invoice {
  id: string;
  tenantId: string;
  operatorId: string;
  billingPeriodId?: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  currency: string;
  subtotal: string;
  taxAmount: string;
  total: string;
  dueAt: string;
  issuedAt?: string;
  paidAt?: string;
  notes?: string;
  lines: InvoiceLine[];
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceLine {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: string;
  total: string;
  category: "ggr_share" | "platform_fee" | "agent_commission" | "setup_fee" | "other";
}

export interface CreditNote {
  id: string;
  invoiceId: string;
  tenantId: string;
  operatorId: string;
  creditNumber: string;
  reason: string;
  amount: string;
  currency: string;
  status: "draft" | "issued" | "applied";
  issuedAt?: string;
  createdAt: string;
}

export interface BillingPeriod {
  id: string;
  tenantId: string;
  operatorId: string;
  periodStart: string;
  periodEnd: string;
  status: BillingPeriodStatus;
  currency: string;
  totalGgr: string;
  totalFees: string;
  totalCommissions: string;
  totalAmount: string;
  invoiceId?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Inputs ────────────────────────────────────────────────────────────────

export interface CreateInvoiceInput {
  tenantId: string;
  operatorId: string;
  currency: string;
  dueAt: string;
  billingPeriodId?: string;
  notes?: string;
  lines: Omit<InvoiceLine, "id" | "invoiceId">[];
}

export interface ApproveInvoiceInput { invoiceId: string; }
export interface IssueInvoiceInput { invoiceId: string; }
export interface MarkPaidInput { invoiceId: string; paidAt?: string; }
export interface DisputeInvoiceInput { invoiceId: string; reason: string; }
export interface VoidInvoiceInput { invoiceId: string; reason: string; }

// ─── DB Client ────────────────────────────────────────────────────────────────

export interface BillingDatabaseClient {
  invoice: {
    findUnique(args: { where: { id: string } | { invoiceNumber: string } }): Promise<Invoice | null>;
    findMany(args: { where: Record<string, unknown>; orderBy?: Record<string, unknown> }): Promise<Invoice[]>;
    create(args: { data: Invoice }): Promise<Invoice>;
    update(args: { where: { id: string }; data: Partial<Invoice> }): Promise<Invoice>;
  };
  creditNote: {
    create(args: { data: CreditNote }): Promise<CreditNote>;
    findMany(args: { where: Record<string, unknown> }): Promise<CreditNote[]>;
  };
  billingPeriod: {
    findUnique(args: { where: { id: string } }): Promise<BillingPeriod | null>;
    findMany(args: { where: Record<string, unknown>; orderBy?: Record<string, unknown> }): Promise<BillingPeriod[]>;
    create(args: { data: BillingPeriod }): Promise<BillingPeriod>;
    update(args: { where: { id: string }; data: Partial<BillingPeriod> }): Promise<BillingPeriod>;
  };
  auditLog: { create(args: { data: Record<string, unknown> }): Promise<void> };
  outboxEvent: { create(args: { data: Record<string, unknown> }): Promise<void> };
  $transaction<T>(fn: (tx: BillingDatabaseClient) => Promise<T>): Promise<T>;
}

// ─── Invoice Number Generator ────────────────────────────────────────────────

function generateInvoiceNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const rand = Math.floor(Math.random() * 100_000).toString().padStart(5, "0");
  return `INV-${year}${month}-${rand}`;
}

// ─── Billing Service ──────────────────────────────────────────────────────────

export class BillingService {
  constructor(private readonly db: BillingDatabaseClient) {}

  async createInvoice(input: CreateInvoiceInput, actor: ActorContext, requestId: string): Promise<Invoice> {
    const subtotal = input.lines.reduce((sum, l) => sum + parseFloat(l.total), 0).toFixed(2);
    const taxAmount = "0.00"; // Tax rules applied separately
    const total = (parseFloat(subtotal) + parseFloat(taxAmount)).toFixed(2);
    const now = new Date().toISOString();
    const invoiceId = crypto.randomUUID();

    return this.db.$transaction(async (tx) => {
      const invoice = await tx.invoice.create({
        data: {
          id: invoiceId,
          tenantId: input.tenantId,
          operatorId: input.operatorId,
          billingPeriodId: input.billingPeriodId,
          invoiceNumber: generateInvoiceNumber(),
          status: "draft",
          currency: input.currency.toUpperCase(),
          subtotal,
          taxAmount,
          total,
          dueAt: input.dueAt,
          notes: input.notes,
          lines: input.lines.map((l) => ({ ...l, id: crypto.randomUUID(), invoiceId })),
          createdAt: now,
          updatedAt: now
        }
      });

      const audit = createAuditEvent({ requestId, actor, action: "create", entityType: "Invoice", entityId: invoiceId });
      await tx.auditLog.create({ data: { ...audit, tenantId: input.tenantId } });
      return invoice;
    });
  }

  async approveInvoice(input: ApproveInvoiceInput, actor: ActorContext, requestId: string): Promise<Invoice> {
    return this.transitionInvoice(input.invoiceId, "approved", actor, requestId, ["draft", "pending_review"]);
  }

  async issueInvoice(input: IssueInvoiceInput, actor: ActorContext, requestId: string): Promise<Invoice> {
    const now = new Date().toISOString();
    return this.transitionInvoice(input.invoiceId, "issued", actor, requestId, ["approved"], { issuedAt: now });
  }

  async markPaid(input: MarkPaidInput, actor: ActorContext, requestId: string): Promise<Invoice> {
    const now = input.paidAt ?? new Date().toISOString();
    return this.transitionInvoice(input.invoiceId, "paid", actor, requestId, ["issued", "overdue"], { paidAt: now });
  }

  async voidInvoice(input: VoidInvoiceInput, actor: ActorContext, requestId: string): Promise<Invoice> {
    return this.transitionInvoice(input.invoiceId, "voided", actor, requestId, ["draft", "pending_review", "approved"]);
  }

  async listInvoices(tenantId: string, operatorId?: string, status?: InvoiceStatus): Promise<Invoice[]> {
    const where: Record<string, unknown> = { tenantId };
    if (operatorId) where["operatorId"] = operatorId;
    if (status) where["status"] = status;
    return this.db.invoice.findMany({ where, orderBy: { createdAt: "desc" } as Record<string, unknown> });
  }

  private async transitionInvoice(
    id: string,
    newStatus: InvoiceStatus,
    actor: ActorContext,
    requestId: string,
    allowedFrom: InvoiceStatus[],
    extra?: Partial<Invoice>
  ): Promise<Invoice> {
    const invoice = await this.db.invoice.findUnique({ where: { id } });
    if (!invoice) throw new Error("Invoice not found");
    if (!allowedFrom.includes(invoice.status)) {
      throw new Error(`Cannot transition invoice from ${invoice.status} to ${newStatus}`);
    }
    const now = new Date().toISOString();
    return this.db.$transaction(async (tx) => {
      const updated = await tx.invoice.update({ where: { id }, data: { status: newStatus, ...extra, updatedAt: now } });
      const audit = createAuditEvent({ requestId, actor, action: "update", entityType: "Invoice", entityId: id, diff: { status: newStatus } });
      await tx.auditLog.create({ data: { ...audit, tenantId: invoice.tenantId } });
      return updated;
    });
  }
}
