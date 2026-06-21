// Data Pipeline Service — ETL/ELT, CDC Ingestion, Validation, Replay, Backfill

export type PipelineType = "cdc" | "event_stream" | "batch" | "backfill" | "replay";
export type PipelineStatus = "idle" | "running" | "paused" | "completed" | "failed";
export type DataDomain = "aggregator" | "b2c" | "b2b" | "wallet" | "payment" | "crm" | "compliance" | "media";

export interface PipelineDefinition {
  id: string;
  tenantId: string;
  domain: DataDomain;
  name: string;
  type: PipelineType;
  sourceTable: string;
  targetTable: string;
  transformSql?: string;
  cronSchedule?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PipelineRun {
  id: string;
  pipelineId: string;
  tenantId: string;
  status: PipelineStatus;
  type: PipelineType;
  startedAt: string;
  completedAt?: string;
  rowsRead: number;
  rowsWritten: number;
  rowsRejected: number;
  lagSeconds?: number;
  error?: string;
  checkpoint?: string;
}

export interface DataQualityCheck {
  id: string;
  pipelineId: string;
  runId: string;
  tenantId: string;
  checkType: "null_check" | "range_check" | "uniqueness" | "freshness" | "reconciliation" | "schema";
  targetTable: string;
  column?: string;
  passed: boolean;
  details?: string;
  checkedAt: string;
}

// ─── Pipeline Registry ────────────────────────────────────────────────────────

export const defaultPipelines: Omit<PipelineDefinition, "id" | "tenantId" | "createdAt" | "updatedAt">[] = [
  { domain: "b2c", name: "Bets to FactBet", type: "cdc", sourceTable: "bets", targetTable: "fact_bets", isActive: true },
  { domain: "wallet", name: "Wallet Transactions to FactWalletTransaction", type: "cdc", sourceTable: "wallet_transactions", targetTable: "fact_wallet_transactions", isActive: true },
  { domain: "payment", name: "Payments to FactPayment", type: "cdc", sourceTable: "payments", targetTable: "fact_payments", isActive: true },
  { domain: "b2c", name: "Bonus Instances to FactBonus", type: "cdc", sourceTable: "bonus_instances", targetTable: "fact_bonuses", isActive: true },
  { domain: "aggregator", name: "Settlement Cycles to FactSettlement", type: "batch", sourceTable: "settlement_cycles", targetTable: "fact_settlements", cronSchedule: "0 2 * * *", isActive: true },
  { domain: "b2b", name: "Invoices to FactInvoice", type: "batch", sourceTable: "invoices", targetTable: "fact_invoices", cronSchedule: "0 3 * * *", isActive: true },
  { domain: "aggregator", name: "Provider KPIs rollup", type: "batch", sourceTable: "fact_bets", targetTable: "provider_kpis", cronSchedule: "0 1 * * *", isActive: true },
  { domain: "b2c", name: "Player KPIs rollup", type: "batch", sourceTable: "fact_bets", targetTable: "player_kpis", cronSchedule: "0 4 * * *", isActive: true }
];

// ─── Pipeline Service ──────────────────────────────────────────────────────────

export interface PipelineDatabaseClient {
  pipelineDefinition: {
    findUnique(args: { where: { id: string } }): Promise<PipelineDefinition | null>;
    findMany(args: { where: Record<string, unknown> }): Promise<PipelineDefinition[]>;
    create(args: { data: PipelineDefinition }): Promise<PipelineDefinition>;
    update(args: { where: { id: string }; data: Partial<PipelineDefinition> }): Promise<PipelineDefinition>;
  };
  pipelineRun: {
    create(args: { data: PipelineRun }): Promise<PipelineRun>;
    findUnique(args: { where: { id: string } }): Promise<PipelineRun | null>;
    update(args: { where: { id: string }; data: Partial<PipelineRun> }): Promise<PipelineRun>;
    findMany(args: { where: Record<string, unknown>; orderBy?: Record<string, unknown>; take?: number }): Promise<PipelineRun[]>;
  };
  dataQualityCheck: {
    create(args: { data: DataQualityCheck }): Promise<DataQualityCheck>;
    findMany(args: { where: Record<string, unknown> }): Promise<DataQualityCheck[]>;
  };
}

export class DataPipelineService {
  constructor(private readonly db: PipelineDatabaseClient) {}

  async startRun(pipelineId: string, type: PipelineType): Promise<PipelineRun> {
    const pipeline = await this.db.pipelineDefinition.findUnique({ where: { id: pipelineId } });
    if (!pipeline) throw new Error(`Pipeline not found: ${pipelineId}`);
    if (!pipeline.isActive) throw new Error(`Pipeline is not active: ${pipelineId}`);

    const now = new Date().toISOString();
    return this.db.pipelineRun.create({
      data: {
        id: crypto.randomUUID(),
        pipelineId,
        tenantId: pipeline.tenantId,
        status: "running",
        type,
        startedAt: now,
        rowsRead: 0,
        rowsWritten: 0,
        rowsRejected: 0
      }
    });
  }

  async completeRun(runId: string, stats: { rowsRead: number; rowsWritten: number; rowsRejected: number; checkpoint?: string }): Promise<PipelineRun> {
    return this.db.pipelineRun.update({
      where: { id: runId },
      data: { ...stats, status: "completed", completedAt: new Date().toISOString() }
    });
  }

  async failRun(runId: string, error: string): Promise<PipelineRun> {
    return this.db.pipelineRun.update({
      where: { id: runId },
      data: { status: "failed", completedAt: new Date().toISOString(), error }
    });
  }

  async recordQualityCheck(check: Omit<DataQualityCheck, "id" | "checkedAt">): Promise<DataQualityCheck> {
    return this.db.dataQualityCheck.create({
      data: { ...check, id: crypto.randomUUID(), checkedAt: new Date().toISOString() }
    });
  }

  async getRecentRuns(tenantId: string, limit = 20): Promise<PipelineRun[]> {
    return this.db.pipelineRun.findMany({
      where: { tenantId },
      orderBy: { startedAt: "desc" } as Record<string, unknown>,
      take: limit
    });
  }

  async getActivePipelines(tenantId: string): Promise<PipelineDefinition[]> {
    return this.db.pipelineDefinition.findMany({ where: { tenantId, isActive: true } });
  }
}
