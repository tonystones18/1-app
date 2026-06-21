// Reporting Service — Governed Reports for Aggregator, B2B, B2C, Finance, Compliance

export type ReportDomain = "aggregator" | "b2b" | "b2c" | "finance" | "compliance" | "executive";
export type ReportStatus = "queued" | "generating" | "ready" | "failed" | "expired";
export type ReportFormat = "json" | "csv" | "xlsx" | "pdf";

export interface ReportDefinition {
  id: string;
  tenantId: string;
  domain: ReportDomain;
  code: string;
  name: string;
  description: string;
  parameters: ReportParameter[];
  requiredPermissions: string[];
  supportedFormats: ReportFormat[];
  isActive: boolean;
  createdAt: string;
}

export interface ReportParameter {
  name: string;
  type: "string" | "date" | "enum" | "currency";
  required: boolean;
  options?: string[];
  description: string;
}

export interface ReportExport {
  id: string;
  definitionId: string;
  tenantId: string;
  requestedBy: string;
  parameters: Record<string, unknown>;
  format: ReportFormat;
  status: ReportStatus;
  rowCount?: number;
  fileKey?: string;
  fileUrl?: string;
  expiresAt?: string;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

export interface ReportSchedule {
  id: string;
  definitionId: string;
  tenantId: string;
  recipientIds: string[];
  format: ReportFormat;
  cronExpression: string;
  parameters: Record<string, unknown>;
  isActive: boolean;
  lastRunAt?: string;
  nextRunAt: string;
  createdAt: string;
}

// ─── Report Catalog ───────────────────────────────────────────────────────────

export const reportCatalog: ReportDefinition[] = [
  {
    id: "rpt-provider-pl",
    tenantId: "platform",
    domain: "aggregator",
    code: "PROVIDER_PL",
    name: "Provider P&L",
    description: "Revenue, cost, margin, fees, and settlement exposure by provider",
    parameters: [
      { name: "periodStart", type: "date", required: true, description: "Period start date" },
      { name: "periodEnd", type: "date", required: true, description: "Period end date" },
      { name: "providerId", type: "string", required: false, description: "Filter by provider" },
      { name: "currency", type: "currency", required: false, description: "Settlement currency" }
    ],
    requiredPermissions: ["finance:read"],
    supportedFormats: ["json", "csv", "xlsx"],
    isActive: true,
    createdAt: "2026-06-21T00:00:00.000Z"
  },
  {
    id: "rpt-operator-pl",
    tenantId: "platform",
    domain: "aggregator",
    code: "OPERATOR_PL",
    name: "Operator P&L",
    description: "Revenue, costs, bonuses, payment fees, commissions per operator",
    parameters: [
      { name: "periodStart", type: "date", required: true, description: "Period start date" },
      { name: "periodEnd", type: "date", required: true, description: "Period end date" },
      { name: "operatorId", type: "string", required: false, description: "Filter by operator" }
    ],
    requiredPermissions: ["aggregator:read"],
    supportedFormats: ["json", "csv", "xlsx"],
    isActive: true,
    createdAt: "2026-06-21T00:00:00.000Z"
  },
  {
    id: "rpt-ggr",
    tenantId: "platform",
    domain: "b2c",
    code: "GGR_REPORT",
    name: "GGR Report",
    description: "Gross gaming revenue by operator, game, player cohort, and time period",
    parameters: [
      { name: "periodStart", type: "date", required: true, description: "Period start date" },
      { name: "periodEnd", type: "date", required: true, description: "Period end date" },
      { name: "operatorId", type: "string", required: false, description: "Filter by operator" },
      { name: "currency", type: "currency", required: false, description: "Report currency" }
    ],
    requiredPermissions: ["player:read"],
    supportedFormats: ["json", "csv", "xlsx", "pdf"],
    isActive: true,
    createdAt: "2026-06-21T00:00:00.000Z"
  },
  {
    id: "rpt-deposits",
    tenantId: "platform",
    domain: "b2c",
    code: "DEPOSITS_REPORT",
    name: "Deposits Report",
    description: "Deposit volume, acceptance rate, PSP performance, and method breakdown",
    parameters: [
      { name: "periodStart", type: "date", required: true, description: "Period start date" },
      { name: "periodEnd", type: "date", required: true, description: "Period end date" },
      { name: "operatorId", type: "string", required: false, description: "Filter by operator" }
    ],
    requiredPermissions: ["payment:read"],
    supportedFormats: ["json", "csv", "xlsx"],
    isActive: true,
    createdAt: "2026-06-21T00:00:00.000Z"
  },
  {
    id: "rpt-compliance",
    tenantId: "platform",
    domain: "compliance",
    code: "COMPLIANCE_KYC",
    name: "KYC Compliance Report",
    description: "KYC review queue status, document approvals, pending cases, and jurisdiction evidence",
    parameters: [
      { name: "periodStart", type: "date", required: true, description: "Period start date" },
      { name: "periodEnd", type: "date", required: true, description: "Period end date" },
      { name: "jurisdiction", type: "string", required: false, description: "Filter by jurisdiction" }
    ],
    requiredPermissions: ["audit:read"],
    supportedFormats: ["json", "csv", "pdf"],
    isActive: true,
    createdAt: "2026-06-21T00:00:00.000Z"
  }
];

// ─── Reporting Service ────────────────────────────────────────────────────────

export interface ReportingDatabaseClient {
  reportExport: {
    create(args: { data: ReportExport }): Promise<ReportExport>;
    findUnique(args: { where: { id: string } }): Promise<ReportExport | null>;
    update(args: { where: { id: string }; data: Partial<ReportExport> }): Promise<ReportExport>;
    findMany(args: { where: Record<string, unknown>; orderBy?: Record<string, unknown>; take?: number }): Promise<ReportExport[]>;
  };
  reportSchedule: {
    create(args: { data: ReportSchedule }): Promise<ReportSchedule>;
    findMany(args: { where: Record<string, unknown> }): Promise<ReportSchedule[]>;
    update(args: { where: { id: string }; data: Partial<ReportSchedule> }): Promise<ReportSchedule>;
  };
}

export class ReportingService {
  constructor(private readonly db: ReportingDatabaseClient) {}

  getCatalog(domain?: ReportDomain): ReportDefinition[] {
    if (domain) return reportCatalog.filter((r) => r.domain === domain);
    return reportCatalog;
  }

  getDefinition(code: string): ReportDefinition | undefined {
    return reportCatalog.find((r) => r.code === code);
  }

  async requestExport(
    definitionCode: string,
    tenantId: string,
    requestedBy: string,
    parameters: Record<string, unknown>,
    format: ReportFormat = "json"
  ): Promise<ReportExport> {
    const definition = this.getDefinition(definitionCode);
    if (!definition) throw new Error(`Report not found: ${definitionCode}`);

    // Validate required parameters
    for (const param of definition.parameters.filter((p) => p.required)) {
      if (!(param.name in parameters)) {
        throw new Error(`Required parameter missing: ${param.name}`);
      }
    }

    if (!definition.supportedFormats.includes(format)) {
      throw new Error(`Format ${format} not supported for report ${definitionCode}`);
    }

    const now = new Date().toISOString();
    return this.db.reportExport.create({
      data: {
        id: crypto.randomUUID(),
        definitionId: definition.id,
        tenantId,
        requestedBy,
        parameters,
        format,
        status: "queued",
        expiresAt: new Date(Date.now() + 7 * 86_400_000).toISOString(),
        createdAt: now
      }
    });
  }

  async listExports(tenantId: string, requestedBy?: string, limit = 20): Promise<ReportExport[]> {
    const where: Record<string, unknown> = { tenantId };
    if (requestedBy) where["requestedBy"] = requestedBy;
    return this.db.reportExport.findMany({ where, orderBy: { createdAt: "desc" } as Record<string, unknown>, take: limit });
  }
}
