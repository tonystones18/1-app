// Dashboard Service — Dashboard-ready aggregates and layout-specific datasets

import type { KpiValue, KpiGrain } from "@visionesoft/kpi-service";

export type DashboardId =
  | "aggregator_overview"
  | "provider_performance"
  | "operator_performance"
  | "b2c_overview"
  | "finance_overview"
  | "media_center"
  | "ai_copilot"
  | "compliance_center";

export interface DashboardLayout {
  id: DashboardId;
  title: string;
  widgets: DashboardWidget[];
}

export interface DashboardWidget {
  id: string;
  type: "kpi_card" | "time_series" | "table" | "bar_chart" | "pie_chart" | "heat_map" | "alert_list";
  title: string;
  kpiCodes?: string[];
  dataKey: string;
  span: 1 | 2 | 3 | 4;
  row: number;
}

export interface DashboardDataRequest {
  dashboardId: DashboardId;
  tenantId: string;
  grain: KpiGrain;
  period: string;
  filters?: {
    operatorId?: string;
    providerId?: string;
    agentId?: string;
    currency?: string;
  };
}

export interface DashboardData {
  dashboardId: DashboardId;
  kpis: KpiValue[];
  tables: Record<string, unknown[]>;
  charts: Record<string, { labels: string[]; series: { name: string; values: number[] }[] }>;
  alerts: DashboardAlert[];
  computedAt: string;
}

export interface DashboardAlert {
  id: string;
  severity: "info" | "warning" | "critical";
  title: string;
  description: string;
  link?: string;
  timestamp: string;
}

// ─── Dashboard Layouts ────────────────────────────────────────────────────────

export const dashboardLayouts: Record<DashboardId, DashboardLayout> = {
  aggregator_overview: {
    id: "aggregator_overview",
    title: "Aggregator Overview",
    widgets: [
      { id: "w1", type: "kpi_card", title: "Total GGR", kpiCodes: ["GGR"], dataKey: "ggr", span: 1, row: 1 },
      { id: "w2", type: "kpi_card", title: "Total NGR", kpiCodes: ["NGR"], dataKey: "ngr", span: 1, row: 1 },
      { id: "w3", type: "kpi_card", title: "Provider Margin", kpiCodes: ["PROVIDER_MARGIN"], dataKey: "margin", span: 1, row: 1 },
      { id: "w4", type: "kpi_card", title: "Route Success", kpiCodes: ["ROUTE_SUCCESS_RATE"], dataKey: "route_success", span: 1, row: 1 },
      { id: "w5", type: "time_series", title: "Revenue Trend", kpiCodes: ["GGR", "NGR"], dataKey: "revenue_trend", span: 4, row: 2 },
      { id: "w6", type: "table", title: "Top Providers", dataKey: "top_providers", span: 2, row: 3 },
      { id: "w7", type: "table", title: "Top Operators", dataKey: "top_operators", span: 2, row: 3 },
      { id: "w8", type: "alert_list", title: "Recent Alerts", dataKey: "alerts", span: 4, row: 4 }
    ]
  },
  provider_performance: {
    id: "provider_performance",
    title: "Provider Performance",
    widgets: [
      { id: "w1", type: "kpi_card", title: "Active Providers", dataKey: "active_providers", span: 1, row: 1 },
      { id: "w2", type: "kpi_card", title: "Avg Latency", dataKey: "avg_latency", span: 1, row: 1 },
      { id: "w3", type: "kpi_card", title: "Error Rate", dataKey: "error_rate", span: 1, row: 1 },
      { id: "w4", type: "kpi_card", title: "Callback Lag", dataKey: "callback_lag", span: 1, row: 1 },
      { id: "w5", type: "bar_chart", title: "Provider Revenue", dataKey: "provider_revenue", span: 2, row: 2 },
      { id: "w6", type: "bar_chart", title: "Provider Health", dataKey: "provider_health", span: 2, row: 2 },
      { id: "w7", type: "table", title: "Provider Details", dataKey: "provider_table", span: 4, row: 3 }
    ]
  },
  operator_performance: {
    id: "operator_performance",
    title: "Operator Performance",
    widgets: [
      { id: "w1", type: "kpi_card", title: "Active Operators", dataKey: "active_operators", span: 1, row: 1 },
      { id: "w2", type: "kpi_card", title: "Total Deposits", dataKey: "total_deposits", span: 1, row: 1 },
      { id: "w3", type: "kpi_card", title: "Total GGR", kpiCodes: ["GGR"], dataKey: "ggr", span: 1, row: 1 },
      { id: "w4", type: "kpi_card", title: "Avg ARPU", kpiCodes: ["ARPU"], dataKey: "arpu", span: 1, row: 1 },
      { id: "w5", type: "table", title: "Operator Breakdown", dataKey: "operator_breakdown", span: 4, row: 2 }
    ]
  },
  b2c_overview: {
    id: "b2c_overview",
    title: "B2C Overview",
    widgets: [
      { id: "w1", type: "kpi_card", title: "Active Players", dataKey: "active_players", span: 1, row: 1 },
      { id: "w2", type: "kpi_card", title: "GGR", kpiCodes: ["GGR"], dataKey: "ggr", span: 1, row: 1 },
      { id: "w3", type: "kpi_card", title: "Deposits", dataKey: "deposits", span: 1, row: 1 },
      { id: "w4", type: "kpi_card", title: "Bonus Cost Ratio", kpiCodes: ["BONUS_COST_RATIO"], dataKey: "bonus_ratio", span: 1, row: 1 },
      { id: "w5", type: "time_series", title: "Player Activity Trend", dataKey: "player_trend", span: 4, row: 2 }
    ]
  },
  finance_overview: {
    id: "finance_overview",
    title: "Finance Overview",
    widgets: [
      { id: "w1", type: "kpi_card", title: "Revenue", kpiCodes: ["NGR"], dataKey: "ngr", span: 1, row: 1 },
      { id: "w2", type: "kpi_card", title: "Open Settlements", dataKey: "open_settlements", span: 1, row: 1 },
      { id: "w3", type: "kpi_card", title: "Outstanding Invoices", dataKey: "outstanding_invoices", span: 1, row: 1 },
      { id: "w4", type: "kpi_card", title: "Treasury Balance", dataKey: "treasury_balance", span: 1, row: 1 }
    ]
  },
  media_center: {
    id: "media_center",
    title: "Media Center",
    widgets: [
      { id: "w1", type: "kpi_card", title: "Total Assets", dataKey: "total_assets", span: 1, row: 1 },
      { id: "w2", type: "kpi_card", title: "Pending Approvals", dataKey: "pending_approvals", span: 1, row: 1 },
      { id: "w3", type: "kpi_card", title: "AI Generated", dataKey: "ai_generated", span: 1, row: 1 },
      { id: "w4", type: "kpi_card", title: "CDN Deliveries", dataKey: "cdn_deliveries", span: 1, row: 1 }
    ]
  },
  ai_copilot: {
    id: "ai_copilot",
    title: "AI Copilot",
    widgets: [
      { id: "w1", type: "kpi_card", title: "Conversations", dataKey: "conversations", span: 1, row: 1 },
      { id: "w2", type: "kpi_card", title: "Tokens Used", dataKey: "tokens_used", span: 1, row: 1 },
      { id: "w3", type: "kpi_card", title: "AI Cost", dataKey: "ai_cost", span: 1, row: 1 },
      { id: "w4", type: "kpi_card", title: "Insights Generated", dataKey: "insights", span: 1, row: 1 }
    ]
  },
  compliance_center: {
    id: "compliance_center",
    title: "Compliance Center",
    widgets: [
      { id: "w1", type: "kpi_card", title: "Open KYC Cases", dataKey: "open_kyc", span: 1, row: 1 },
      { id: "w2", type: "kpi_card", title: "AML Alerts", dataKey: "aml_alerts", span: 1, row: 1 },
      { id: "w3", type: "kpi_card", title: "Self-Exclusions", dataKey: "self_exclusions", span: 1, row: 1 },
      { id: "w4", type: "kpi_card", title: "RG Interventions", dataKey: "rg_interventions", span: 1, row: 1 }
    ]
  }
};

// ─── Dashboard Service ────────────────────────────────────────────────────────

export interface DashboardDataProvider {
  fetchKpis(request: DashboardDataRequest): Promise<KpiValue[]>;
  fetchTableData(key: string, request: DashboardDataRequest): Promise<unknown[]>;
  fetchChartData(key: string, request: DashboardDataRequest): Promise<{ labels: string[]; series: { name: string; values: number[] }[] }>;
  fetchAlerts(tenantId: string, limit: number): Promise<DashboardAlert[]>;
}

export class DashboardService {
  constructor(private readonly provider: DashboardDataProvider) {}

  getLayout(dashboardId: DashboardId): DashboardLayout {
    const layout = dashboardLayouts[dashboardId];
    if (!layout) throw new Error(`Dashboard layout not found: ${dashboardId}`);
    return layout;
  }

  listLayouts(): DashboardLayout[] {
    return Object.values(dashboardLayouts);
  }

  async getData(request: DashboardDataRequest): Promise<DashboardData> {
    const layout = this.getLayout(request.dashboardId);
    const now = new Date().toISOString();

    const [kpis, alerts] = await Promise.all([
      this.provider.fetchKpis(request),
      this.provider.fetchAlerts(request.tenantId, 10)
    ]);

    const tableWidgets = layout.widgets.filter((w) => w.type === "table");
    const chartWidgets = layout.widgets.filter((w) => ["time_series", "bar_chart", "pie_chart"].includes(w.type));

    const [tables, charts] = await Promise.all([
      Promise.all(tableWidgets.map(async (w) => [w.dataKey, await this.provider.fetchTableData(w.dataKey, request)] as const)),
      Promise.all(chartWidgets.map(async (w) => [w.dataKey, await this.provider.fetchChartData(w.dataKey, request)] as const))
    ]);

    return {
      dashboardId: request.dashboardId,
      kpis,
      tables: Object.fromEntries(tables),
      charts: Object.fromEntries(charts),
      alerts,
      computedAt: now
    };
  }
}
