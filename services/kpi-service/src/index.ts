// KPI Service — Governed KPI Definitions, Calculations, and Cube APIs

export type KpiCategory = "aggregator" | "b2b" | "b2c" | "finance" | "operations" | "compliance";
export type KpiGrain = "realtime" | "hourly" | "daily" | "weekly" | "monthly";

export interface KpiDefinition {
  code: string;
  name: string;
  category: KpiCategory;
  formula: string;
  description: string;
  unit: "currency" | "percent" | "count" | "ratio";
  grain: KpiGrain[];
  sourceDatasets: string[];
  owner: string;
  isActive: boolean;
}

export interface KpiValue {
  code: string;
  value: string;
  currency?: string;
  period: string;
  grain: KpiGrain;
  computedAt: string;
  tenantId: string;
  operatorId?: string;
}

export interface KpiThreshold {
  kpiCode: string;
  tenantId: string;
  warningLevel: number;
  criticalLevel: number;
  direction: "above" | "below";
}

// ─── KPI Catalog ─────────────────────────────────────────────────────────────

export const kpiCatalog: KpiDefinition[] = [
  {
    code: "GGR",
    name: "Gross Gaming Revenue",
    category: "b2c",
    formula: "SUM(bets) - SUM(wins)",
    description: "Total revenue before bonuses and fees",
    unit: "currency",
    grain: ["daily", "weekly", "monthly"],
    sourceDatasets: ["fact_bets", "fact_game_rounds"],
    owner: "finance",
    isActive: true
  },
  {
    code: "NGR",
    name: "Net Gaming Revenue",
    category: "b2c",
    formula: "GGR - bonus_cost - payment_fees",
    description: "Revenue after bonuses and payment processing fees",
    unit: "currency",
    grain: ["daily", "weekly", "monthly"],
    sourceDatasets: ["fact_bets", "fact_bonuses", "fact_payments"],
    owner: "finance",
    isActive: true
  },
  {
    code: "ARPU",
    name: "Average Revenue Per User",
    category: "b2c",
    formula: "GGR / active_players",
    description: "Average revenue generated per active player",
    unit: "currency",
    grain: ["monthly"],
    sourceDatasets: ["fact_bets", "dim_player"],
    owner: "product",
    isActive: true
  },
  {
    code: "PROVIDER_MARGIN",
    name: "Provider Margin",
    category: "aggregator",
    formula: "(sell_price_bps - buy_price_bps) / sell_price_bps",
    description: "Margin percentage on provider routes",
    unit: "percent",
    grain: ["daily", "monthly"],
    sourceDatasets: ["provider_kpis"],
    owner: "aggregator",
    isActive: true
  },
  {
    code: "ROUTE_SUCCESS_RATE",
    name: "Route Success Rate",
    category: "operations",
    formula: "successful_routes / total_route_decisions",
    description: "Percentage of route decisions that completed successfully",
    unit: "percent",
    grain: ["realtime", "hourly", "daily"],
    sourceDatasets: ["route_decision_log"],
    owner: "engineering",
    isActive: true
  },
  {
    code: "DEPOSIT_ACCEPTANCE_RATE",
    name: "Deposit Acceptance Rate",
    category: "b2c",
    formula: "completed_deposits / total_deposit_attempts",
    description: "Percentage of deposit attempts that completed successfully",
    unit: "percent",
    grain: ["hourly", "daily"],
    sourceDatasets: ["fact_payments"],
    owner: "payments",
    isActive: true
  },
  {
    code: "PLAYER_CHURN_RATE",
    name: "Player Churn Rate",
    category: "b2c",
    formula: "churned_players / active_players_start_period",
    description: "Percentage of active players who became inactive",
    unit: "percent",
    grain: ["monthly"],
    sourceDatasets: ["dim_player", "fact_bets"],
    owner: "product",
    isActive: true
  },
  {
    code: "BONUS_COST_RATIO",
    name: "Bonus Cost Ratio",
    category: "b2c",
    formula: "bonus_cost / GGR",
    description: "Bonus cost as a percentage of GGR",
    unit: "percent",
    grain: ["daily", "monthly"],
    sourceDatasets: ["fact_bonuses", "fact_bets"],
    owner: "product",
    isActive: true
  }
];

// ─── KPI Service ──────────────────────────────────────────────────────────────

export interface KpiDataSource {
  computeKpi(
    code: string,
    tenantId: string,
    grain: KpiGrain,
    period: string,
    filters?: { operatorId?: string; currency?: string }
  ): Promise<KpiValue>;
}

export class KpiService {
  constructor(private readonly dataSource: KpiDataSource) {}

  getCatalog(category?: KpiCategory): KpiDefinition[] {
    if (category) return kpiCatalog.filter((k) => k.category === category);
    return kpiCatalog;
  }

  getDefinition(code: string): KpiDefinition | undefined {
    return kpiCatalog.find((k) => k.code === code);
  }

  async getKpiValue(
    code: string,
    tenantId: string,
    grain: KpiGrain,
    period: string,
    filters?: { operatorId?: string; currency?: string }
  ): Promise<KpiValue> {
    const definition = this.getDefinition(code);
    if (!definition?.isActive) throw new Error(`KPI not found or inactive: ${code}`);
    if (!definition.grain.includes(grain)) throw new Error(`KPI ${code} does not support grain: ${grain}`);
    return this.dataSource.computeKpi(code, tenantId, grain, period, filters);
  }

  async getDashboardKpis(
    tenantId: string,
    grain: KpiGrain,
    period: string,
    category?: KpiCategory
  ): Promise<KpiValue[]> {
    const definitions = this.getCatalog(category).filter((d) => d.grain.includes(grain) && d.isActive);
    const results = await Promise.allSettled(
      definitions.map((d) => this.dataSource.computeKpi(d.code, tenantId, grain, period))
    );
    return results.flatMap((r) => r.status === "fulfilled" ? [r.value] : []);
  }
}
