// Warehouse Service — ClickHouse warehouse schema coordination and ingestion management

export type WarehouseLayer = "raw" | "normalized" | "business" | "executive";

export interface WarehouseTable {
  schema: string;
  table: string;
  layer: WarehouseLayer;
  domain: string;
  description: string;
  primaryKey: string[];
  partitionKey?: string;
  orderBy: string[];
  ttlDays?: number;
}

export interface DataCatalogEntry {
  id: string;
  tenantId: string;
  tableName: string;
  schema: string;
  layer: WarehouseLayer;
  description: string;
  owner: string;
  classification: "pii" | "financial" | "compliance" | "operational" | "public";
  refreshCadence: string;
  retentionDays: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DataLineageEdge {
  id: string;
  sourceTable: string;
  targetTable: string;
  transformationType: "cdc" | "aggregation" | "join" | "filter" | "enrichment";
  pipelineId?: string;
  createdAt: string;
}

// ─── Warehouse Table Definitions ──────────────────────────────────────────────

export const warehouseTables: WarehouseTable[] = [
  // Raw Layer
  { schema: "raw", table: "raw_events", layer: "raw", domain: "platform", description: "Immutable raw domain events", primaryKey: ["id"], orderBy: ["received_at"], ttlDays: 365 * 7, partitionKey: "toYYYYMM(received_at)" },
  { schema: "raw", table: "raw_callbacks", layer: "raw", domain: "aggregator", description: "Raw provider callbacks", primaryKey: ["id"], orderBy: ["received_at"], ttlDays: 365 * 2, partitionKey: "toYYYYMM(received_at)" },
  { schema: "raw", table: "raw_payments", layer: "raw", domain: "payment", description: "Raw payment events", primaryKey: ["id"], orderBy: ["received_at"], ttlDays: 365 * 7, partitionKey: "toYYYYMM(received_at)" },
  // Normalized Layer
  { schema: "normalized", table: "fact_bets", layer: "normalized", domain: "b2c", description: "Bet-level analytics facts", primaryKey: ["bet_id"], orderBy: ["placed_at"], partitionKey: "toYYYYMM(placed_at)" },
  { schema: "normalized", table: "fact_wallet_transactions", layer: "normalized", domain: "wallet", description: "Wallet transaction facts", primaryKey: ["transaction_id"], orderBy: ["posted_at"], partitionKey: "toYYYYMM(posted_at)" },
  { schema: "normalized", table: "fact_payments", layer: "normalized", domain: "payment", description: "Payment facts", primaryKey: ["payment_id"], orderBy: ["created_at"], partitionKey: "toYYYYMM(created_at)" },
  { schema: "normalized", table: "fact_bonuses", layer: "normalized", domain: "b2c", description: "Bonus cost and wagering facts", primaryKey: ["instance_id"], orderBy: ["activated_at"], partitionKey: "toYYYYMM(activated_at)" },
  { schema: "normalized", table: "fact_settlements", layer: "normalized", domain: "aggregator", description: "Settlement facts", primaryKey: ["settlement_id"], orderBy: ["period_end"], partitionKey: "toYYYYMM(period_end)" },
  // Dimension Tables
  { schema: "dimensions", table: "dim_player", layer: "normalized", domain: "b2c", description: "Player dimension", primaryKey: ["player_id"], orderBy: ["player_id"] },
  { schema: "dimensions", table: "dim_operator", layer: "normalized", domain: "b2b", description: "Operator dimension", primaryKey: ["operator_id"], orderBy: ["operator_id"] },
  { schema: "dimensions", table: "dim_provider", layer: "normalized", domain: "aggregator", description: "Provider dimension", primaryKey: ["provider_id"], orderBy: ["provider_id"] },
  { schema: "dimensions", table: "dim_game", layer: "normalized", domain: "aggregator", description: "Game dimension", primaryKey: ["game_id"], orderBy: ["game_id"] },
  { schema: "dimensions", table: "dim_time", layer: "normalized", domain: "platform", description: "Time dimension", primaryKey: ["date_id"], orderBy: ["date_id"] },
  // Business KPI Layer
  { schema: "kpis", table: "provider_kpis", layer: "business", domain: "aggregator", description: "Provider KPI aggregates", primaryKey: ["provider_id", "period_date"], orderBy: ["period_date", "provider_id"], partitionKey: "toYYYYMM(period_date)" },
  { schema: "kpis", table: "operator_kpis", layer: "business", domain: "aggregator", description: "Operator KPI aggregates", primaryKey: ["operator_id", "period_date"], orderBy: ["period_date", "operator_id"], partitionKey: "toYYYYMM(period_date)" },
  { schema: "kpis", table: "player_kpis", layer: "business", domain: "b2c", description: "Player KPI aggregates", primaryKey: ["player_id", "period_date"], orderBy: ["period_date", "player_id"], partitionKey: "toYYYYMM(period_date)" },
  { schema: "kpis", table: "financial_kpis", layer: "business", domain: "finance", description: "Financial KPI aggregates", primaryKey: ["period_date", "currency"], orderBy: ["period_date"], partitionKey: "toYYYYMM(period_date)" },
  // Executive Layer
  { schema: "executive", table: "executive_dashboard", layer: "executive", domain: "platform", description: "Executive dashboard dataset", primaryKey: ["snapshot_at"], orderBy: ["snapshot_at"] },
  { schema: "executive", table: "financial_summaries", layer: "executive", domain: "finance", description: "Financial summary snapshots", primaryKey: ["period_date"], orderBy: ["period_date"] }
];

// ─── Warehouse Service ─────────────────────────────────────────────────────────

export interface WarehouseQueryClient {
  query<T>(sql: string, params?: unknown[]): Promise<T[]>;
}

export class WarehouseService {
  constructor(private readonly client: WarehouseQueryClient) {}

  getTableDefinitions(layer?: WarehouseLayer): WarehouseTable[] {
    if (layer) return warehouseTables.filter((t) => t.layer === layer);
    return warehouseTables;
  }

  getTableByName(tableName: string): WarehouseTable | undefined {
    return warehouseTables.find((t) => t.table === tableName);
  }

  async queryFactBets(tenantId: string, periodStart: string, periodEnd: string, operatorId?: string): Promise<unknown[]> {
    const conditions = ["tenant_id = ?", "placed_at >= ?", "placed_at < ?"];
    const params: unknown[] = [tenantId, periodStart, periodEnd];
    if (operatorId) { conditions.push("operator_id = ?"); params.push(operatorId); }
    return this.client.query(`SELECT * FROM normalized.fact_bets WHERE ${conditions.join(" AND ")} LIMIT 1000`, params);
  }

  async getGgrSummary(tenantId: string, periodStart: string, periodEnd: string): Promise<{ ggr: number; ngr: number; bets: number; wins: number }> {
    const results = await this.client.query<{ ggr: number; ngr: number; bets: number; wins: number }>(
      `SELECT SUM(bet_amount) as bets, SUM(win_amount) as wins, SUM(bet_amount - win_amount) as ggr, SUM(bet_amount - win_amount - bonus_contribution) as ngr FROM normalized.fact_bets WHERE tenant_id = ? AND placed_at >= ? AND placed_at < ?`,
      [tenantId, periodStart, periodEnd]
    );
    return results[0] ?? { ggr: 0, ngr: 0, bets: 0, wins: 0 };
  }

  generateCreateTableDdl(table: WarehouseTable): string {
    const lines = [
      `CREATE TABLE IF NOT EXISTS ${table.schema}.${table.table} (`,
      `  /* Column definitions managed by migration */`,
      `) ENGINE = MergeTree()`
    ];
    if (table.partitionKey) lines.push(`PARTITION BY ${table.partitionKey}`);
    lines.push(`ORDER BY (${table.orderBy.join(", ")})`);
    if (table.ttlDays) lines.push(`TTL toDateTime(received_at) + INTERVAL ${table.ttlDays} DAY`);
    lines.push(";");
    return lines.join("\n");
  }
}
