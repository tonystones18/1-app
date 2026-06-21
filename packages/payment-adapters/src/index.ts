// Payment Adapter SDK — VisioneSoft Platform
// Common contracts, interfaces, and mock for all PSP integrations

// ─── Core Types ────────────────────────────────────────────────────────────

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

export type PaymentMethod =
  | "card"
  | "bank_transfer"
  | "crypto_btc"
  | "crypto_eth"
  | "crypto_usdt"
  | "crypto_usdc"
  | "e_wallet"
  | "mobile_money";

export interface PspCapabilities {
  supportedMethods: PaymentMethod[];
  supportedCurrencies: string[];
  supportedCountries: string[];
  supportsDeposit: boolean;
  supportsWithdrawal: boolean;
  supportsRefund: boolean;
  supportsWebhook: boolean;
  webhookSignatureAlgorithm?: string;
  minDepositAmount?: string;
  maxDepositAmount?: string;
}

// ─── Create Payment ────────────────────────────────────────────────────────

export interface CreatePaymentInput {
  operatorId: string;
  playerId: string;
  externalReference: string;
  direction: PaymentDirection;
  method: PaymentMethod;
  currency: string;
  amount: string;
  country: string;
  returnUrl?: string;
  webhookUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface CreatePaymentResult {
  pspReference: string;
  status: PaymentStatus;
  redirectUrl?: string;
  expiresAt?: string;
  metadata?: Record<string, unknown>;
}

// ─── Check Status ────────────────────────────────────────────────────────

export interface CheckPaymentStatusInput {
  pspReference: string;
  externalReference: string;
}

export interface PaymentStatusResult {
  pspReference: string;
  status: PaymentStatus;
  amount?: string;
  currency?: string;
  paidAt?: string;
  failureReason?: string;
  metadata?: Record<string, unknown>;
}

// ─── Refund / Reversal ─────────────────────────────────────────────────────

export interface RefundInput {
  pspReference: string;
  externalReference: string;
  amount: string;
  currency: string;
  reason?: string;
}

export interface RefundResult {
  refundReference: string;
  status: PaymentStatus;
  processedAt?: string;
}

// ─── Webhook / Callback ───────────────────────────────────────────────────

export interface RawPspCallback {
  headers: Record<string, string>;
  body: unknown;
  receivedAt: string;
  sourceIp?: string;
}

export interface NormalizedPspCallback {
  pspReference: string;
  externalReference?: string;
  status: PaymentStatus;
  amount?: string;
  currency?: string;
  direction?: PaymentDirection;
  timestamp: string;
  isTest?: boolean;
  metadata?: Record<string, unknown>;
}

// ─── Health ────────────────────────────────────────────────────────────────

export interface PspHealthResult {
  status: "ok" | "degraded" | "down";
  latencyMs: number;
  checkedAt: string;
}

// ─── Adapter Interface ────────────────────────────────────────────────────

export interface PaymentAdapter {
  readonly pspCode: string;
  getCapabilities(): PspCapabilities;
  createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult>;
  checkStatus(input: CheckPaymentStatusInput): Promise<PaymentStatusResult>;
  refund(input: RefundInput): Promise<RefundResult>;
  parseCallback(raw: RawPspCallback): Promise<NormalizedPspCallback>;
  validateCallbackSignature(raw: RawPspCallback, secret: string): boolean;
  healthCheck(): Promise<PspHealthResult>;
}

// ─── Mock PSP Adapter ────────────────────────────────────────────────────

export class MockPaymentAdapter implements PaymentAdapter {
  readonly pspCode: string;

  constructor(code: string) {
    this.pspCode = code;
  }

  getCapabilities(): PspCapabilities {
    return {
      supportedMethods: ["card", "bank_transfer", "crypto_usdt"],
      supportedCurrencies: ["USD", "EUR", "GBP"],
      supportedCountries: ["US", "GB", "MT", "CY"],
      supportsDeposit: true,
      supportsWithdrawal: true,
      supportsRefund: true,
      supportsWebhook: true,
      webhookSignatureAlgorithm: "hmac-sha256"
    };
  }

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    return {
      pspReference: crypto.randomUUID(),
      status: "pending",
      redirectUrl: `https://mock-psp.example.com/pay/${input.externalReference}`,
      expiresAt: new Date(Date.now() + 3600_000).toISOString()
    };
  }

  async checkStatus(input: CheckPaymentStatusInput): Promise<PaymentStatusResult> {
    return {
      pspReference: input.pspReference,
      status: "completed",
      paidAt: new Date().toISOString()
    };
  }

  async refund(input: RefundInput): Promise<RefundResult> {
    return {
      refundReference: crypto.randomUUID(),
      status: "completed",
      processedAt: new Date().toISOString()
    };
  }

  async parseCallback(raw: RawPspCallback): Promise<NormalizedPspCallback> {
    const body = raw.body as Record<string, unknown>;
    return {
      pspReference: String(body["pspReference"] ?? ""),
      externalReference: String(body["externalReference"] ?? ""),
      status: "completed",
      amount: String(body["amount"] ?? "0"),
      currency: String(body["currency"] ?? "USD"),
      timestamp: raw.receivedAt
    };
  }

  validateCallbackSignature(_raw: RawPspCallback, _secret: string): boolean {
    return true;
  }

  async healthCheck(): Promise<PspHealthResult> {
    return {
      status: "ok",
      latencyMs: 5,
      checkedAt: new Date().toISOString()
    };
  }
}

// ─── PSP Adapter Registry ─────────────────────────────────────────────────

export class PaymentAdapterRegistry {
  private adapters: Map<string, PaymentAdapter> = new Map();

  register(adapter: PaymentAdapter): void {
    this.adapters.set(adapter.pspCode, adapter);
  }

  get(pspCode: string): PaymentAdapter | undefined {
    return this.adapters.get(pspCode);
  }

  require(pspCode: string): PaymentAdapter {
    const adapter = this.adapters.get(pspCode);
    if (!adapter) {
      throw new Error(`No adapter registered for PSP: ${pspCode}`);
    }
    return adapter;
  }

  list(): string[] {
    return Array.from(this.adapters.keys());
  }
}
