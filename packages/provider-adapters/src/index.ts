// Provider Adapter SDK — VisioneSoft Platform
// Common contracts, interfaces, and test harness for all game provider integrations

// ─── Core Types ────────────────────────────────────────────────────────────

export type WalletMode = "seamless" | "transfer" | "hybrid";

export type LaunchDeviceType = "desktop" | "mobile" | "tablet";

export interface ProviderCapabilities {
  walletMode: WalletMode;
  supportedCurrencies: string[];
  supportedJurisdictions: string[];
  supportsRtp: boolean;
  supportsGameSync: boolean;
  supportsRollback: boolean;
  supportsBalance: boolean;
  callbackSignatureAlgorithm?: string;
}

// ─── Game Sync ────────────────────────────────────────────────────────────

export interface ProviderGame {
  externalId: string;
  name: string;
  category: string;
  rtpBps?: number;
  volatility?: string;
  supportedCurrencies: string[];
  supportedJurisdictions: string[];
  supportedDevices: LaunchDeviceType[];
  thumbnailUrl?: string;
  isActive: boolean;
  metadata?: Record<string, unknown>;
}

export interface GameSyncResult {
  games: ProviderGame[];
  syncedAt: string;
  totalCount: number;
}

// ─── Launch ────────────────────────────────────────────────────────────────

export interface LaunchGameInput {
  operatorId: string;
  playerId: string;
  sessionToken: string;
  gameId: string;
  externalGameId: string;
  currency: string;
  language: string;
  device: LaunchDeviceType;
  lobbyUrl: string;
  depositUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface LaunchGameResult {
  launchUrl: string;
  sessionId: string;
  expiresAt?: string;
}

// ─── Wallet Operations ────────────────────────────────────────────────────

export interface WalletBalanceInput {
  operatorId: string;
  playerId: string;
  currency: string;
  sessionToken?: string;
}

export interface WalletBalanceResult {
  balance: string;
  currency: string;
}

export interface WalletDebitInput {
  operatorId: string;
  playerId: string;
  currency: string;
  amount: string;
  transactionId: string;
  gameId: string;
  roundId: string;
  betId: string;
  sessionToken?: string;
  metadata?: Record<string, unknown>;
}

export interface WalletCreditInput {
  operatorId: string;
  playerId: string;
  currency: string;
  amount: string;
  transactionId: string;
  gameId: string;
  roundId: string;
  winId: string;
  betTransactionId?: string;
  sessionToken?: string;
  isFreeRound?: boolean;
  metadata?: Record<string, unknown>;
}

export interface WalletRollbackInput {
  operatorId: string;
  playerId: string;
  currency: string;
  transactionId: string;
  originalTransactionId: string;
  gameId: string;
  roundId: string;
  sessionToken?: string;
  metadata?: Record<string, unknown>;
}

export interface WalletOperationResult {
  success: boolean;
  balance: string;
  currency: string;
  transactionId: string;
  processedAt: string;
}

// ─── Callback ────────────────────────────────────────────────────────────

export interface RawCallback {
  headers: Record<string, string>;
  body: unknown;
  receivedAt: string;
  sourceIp?: string;
}

export type CallbackEventType =
  | "debit"
  | "credit"
  | "rollback"
  | "round_end"
  | "session_end"
  | "free_round_start"
  | "free_round_end"
  | "jackpot_win";

export interface NormalizedCallback {
  eventType: CallbackEventType;
  operatorId: string;
  playerId: string;
  gameId: string;
  roundId: string;
  transactionId: string;
  currency: string;
  amount: string;
  balance?: string;
  timestamp: string;
  isRollback?: boolean;
  isFreeRound?: boolean;
  metadata?: Record<string, unknown>;
}

// ─── Health ────────────────────────────────────────────────────────────────

export interface ProviderHealthCheckResult {
  status: "ok" | "degraded" | "down";
  latencyMs: number;
  errorRate?: number;
  checkedAt: string;
  details?: Record<string, unknown>;
}

// ─── Adapter Interface ────────────────────────────────────────────────────

export interface ProviderAdapter {
  readonly providerCode: string;
  getCapabilities(): ProviderCapabilities;
  syncGames(): Promise<GameSyncResult>;
  launchGame(input: LaunchGameInput): Promise<LaunchGameResult>;
  getBalance(input: WalletBalanceInput): Promise<WalletBalanceResult>;
  debit(input: WalletDebitInput): Promise<WalletOperationResult>;
  credit(input: WalletCreditInput): Promise<WalletOperationResult>;
  rollback(input: WalletRollbackInput): Promise<WalletOperationResult>;
  parseCallback(raw: RawCallback): Promise<NormalizedCallback>;
  healthCheck(): Promise<ProviderHealthCheckResult>;
}

// ─── Mock Adapter (for testing and stubs) ────────────────────────────────

export class MockProviderAdapter implements ProviderAdapter {
  readonly providerCode: string;

  constructor(code: string) {
    this.providerCode = code;
  }

  getCapabilities(): ProviderCapabilities {
    return {
      walletMode: "seamless",
      supportedCurrencies: ["USD", "EUR", "GBP"],
      supportedJurisdictions: ["MT", "GB", "CY"],
      supportsRtp: true,
      supportsGameSync: true,
      supportsRollback: true,
      supportsBalance: true,
      callbackSignatureAlgorithm: "hmac-sha256"
    };
  }

  async syncGames(): Promise<GameSyncResult> {
    return {
      games: [],
      syncedAt: new Date().toISOString(),
      totalCount: 0
    };
  }

  async launchGame(input: LaunchGameInput): Promise<LaunchGameResult> {
    return {
      launchUrl: `https://mock-provider.example.com/launch?game=${input.externalGameId}&session=${input.sessionToken}`,
      sessionId: crypto.randomUUID()
    };
  }

  async getBalance(_input: WalletBalanceInput): Promise<WalletBalanceResult> {
    return { balance: "0.00", currency: "USD" };
  }

  async debit(input: WalletDebitInput): Promise<WalletOperationResult> {
    return {
      success: true,
      balance: "0.00",
      currency: input.currency,
      transactionId: input.transactionId,
      processedAt: new Date().toISOString()
    };
  }

  async credit(input: WalletCreditInput): Promise<WalletOperationResult> {
    return {
      success: true,
      balance: "0.00",
      currency: input.currency,
      transactionId: input.transactionId,
      processedAt: new Date().toISOString()
    };
  }

  async rollback(input: WalletRollbackInput): Promise<WalletOperationResult> {
    return {
      success: true,
      balance: "0.00",
      currency: input.currency,
      transactionId: input.transactionId,
      processedAt: new Date().toISOString()
    };
  }

  async parseCallback(raw: RawCallback): Promise<NormalizedCallback> {
    const body = raw.body as Record<string, unknown>;
    return {
      eventType: "debit",
      operatorId: String(body["operatorId"] ?? ""),
      playerId: String(body["playerId"] ?? ""),
      gameId: String(body["gameId"] ?? ""),
      roundId: String(body["roundId"] ?? ""),
      transactionId: String(body["transactionId"] ?? ""),
      currency: String(body["currency"] ?? "USD"),
      amount: String(body["amount"] ?? "0"),
      timestamp: raw.receivedAt
    };
  }

  async healthCheck(): Promise<ProviderHealthCheckResult> {
    return {
      status: "ok",
      latencyMs: 0,
      checkedAt: new Date().toISOString()
    };
  }
}

// ─── Adapter Registry ─────────────────────────────────────────────────────

export class ProviderAdapterRegistry {
  private adapters: Map<string, ProviderAdapter> = new Map();

  register(adapter: ProviderAdapter): void {
    this.adapters.set(adapter.providerCode, adapter);
  }

  get(providerCode: string): ProviderAdapter | undefined {
    return this.adapters.get(providerCode);
  }

  require(providerCode: string): ProviderAdapter {
    const adapter = this.adapters.get(providerCode);
    if (!adapter) {
      throw new Error(`No adapter registered for provider: ${providerCode}`);
    }
    return adapter;
  }

  list(): string[] {
    return Array.from(this.adapters.keys());
  }
}
