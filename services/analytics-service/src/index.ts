// Analytics Service — Query analytics datasets, expose analytical APIs

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AnalyticsTimeRange {
  from: string;
  to: string;
}

export interface AnalyticsFilter {
  tenantId: string;
  operatorId?: string;
  providerId?: string;
  agentId?: string;
  currency?: string;
  country?: string;
  timeRange: AnalyticsTimeRange;
}

export interface ProviderAnalytics {
  providerId: string;
  providerName: string;
  totalBets: number;
  totalWins: number;
  ggr: string;
  ngr: string;
  margin: string;
  activePlayers: number;
  errorRate: number;
  avgLatencyMs: number;
  period: string;
}

export interface OperatorAnalytics {
  operatorId: string;
  operatorName: string;
  totalDeposits: string;
  totalWithdrawals: string;
  ggr: string;
  ngr: string;
  activePlayers: number;
  newPlayers: number;
  bonusCost: string;
  period: string;
}

export interface PlayerAnalytics {
  playerId: string;
  operatorId: string;
  totalDeposited: string;
  totalWithdrawn: string;
  ggr: string;
  bonusesGranted: string;
  riskScore: number;
  lastActiveAt: string;
  ltv: string;
}

export interface RouteAnalytics {
  routePolicyId: string;
  providerId: string;
  operatorId?: string;
  successRate: number;
  errorRate: number;
  avgLatencyMs: number;
  totalDecisions: number;
  totalRevenue: string;
  margin: string;
  rtpActual: number;
  period: string;
}

export interface PaymentAnalytics {
  tenantId: string;
  operatorId?: string;
  direction: "deposit" | "withdrawal";
  pspCode: string;
  currency: string;
  totalCount: number;
  totalAmount: string;
  successRate: number;
  avgProcessingTimeMs: number;
  period: string;
}

// ─── Analytics Query Interface ────────────────────────────────────────────────

export interface AnalyticsDataSource {
  queryProviderAnalytics(filter: AnalyticsFilter): Promise<ProviderAnalytics[]>;
  queryOperatorAnalytics(filter: AnalyticsFilter): Promise<OperatorAnalytics[]>;
  queryPlayerAnalytics(filter: AnalyticsFilter): Promise<PlayerAnalytics[]>;
  queryRouteAnalytics(filter: AnalyticsFilter): Promise<RouteAnalytics[]>;
  queryPaymentAnalytics(filter: AnalyticsFilter): Promise<PaymentAnalytics[]>;
}

// ─── Analytics Service ────────────────────────────────────────────────────────

export class AnalyticsService {
  constructor(private readonly dataSource: AnalyticsDataSource) {}

  async getProviderAnalytics(filter: AnalyticsFilter): Promise<ProviderAnalytics[]> {
    return this.dataSource.queryProviderAnalytics(filter);
  }

  async getOperatorAnalytics(filter: AnalyticsFilter): Promise<OperatorAnalytics[]> {
    return this.dataSource.queryOperatorAnalytics(filter);
  }

  async getPlayerAnalytics(filter: AnalyticsFilter): Promise<PlayerAnalytics[]> {
    return this.dataSource.queryPlayerAnalytics(filter);
  }

  async getRouteAnalytics(filter: AnalyticsFilter): Promise<RouteAnalytics[]> {
    return this.dataSource.queryRouteAnalytics(filter);
  }

  async getPaymentAnalytics(filter: AnalyticsFilter): Promise<PaymentAnalytics[]> {
    return this.dataSource.queryPaymentAnalytics(filter);
  }

  async getPlatformSummary(filter: AnalyticsFilter): Promise<{
    totalGgr: string;
    totalNgr: string;
    activeOperators: number;
    activePlayers: number;
    totalDeposits: string;
    totalWithdrawals: string;
  }> {
    const [operators, payments] = await Promise.all([
      this.dataSource.queryOperatorAnalytics(filter),
      this.dataSource.queryPaymentAnalytics(filter)
    ]);

    const totalGgr = operators.reduce((sum, o) => sum + parseFloat(o.ggr), 0).toFixed(2);
    const totalNgr = operators.reduce((sum, o) => sum + parseFloat(o.ngr), 0).toFixed(2);
    const activeOperators = operators.filter((o) => parseFloat(o.ggr) > 0).length;
    const activePlayers = operators.reduce((sum, o) => sum + o.activePlayers, 0);
    const totalDeposits = payments.filter((p) => p.direction === "deposit").reduce((sum, p) => sum + parseFloat(p.totalAmount), 0).toFixed(2);
    const totalWithdrawals = payments.filter((p) => p.direction === "withdrawal").reduce((sum, p) => sum + parseFloat(p.totalAmount), 0).toFixed(2);

    return { totalGgr, totalNgr, activeOperators, activePlayers, totalDeposits, totalWithdrawals };
  }
}
