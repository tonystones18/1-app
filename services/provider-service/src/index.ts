// Provider Service — Provider onboarding, game sync, health monitoring, incident tracking
// Works with provider-adapters for actual provider API communication

import type { ActorContext } from "@visionesoft/shared-types";
import { createAuditEvent } from "@visionesoft/audit";
import type { ProviderAdapter, ProviderAdapterRegistry } from "@visionesoft/provider-adapters";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ProviderStatus = "draft" | "sandbox" | "certification" | "active" | "suspended" | "archived";
export type ProviderIntegrationType = "direct_api" | "vendor_api" | "iframe" | "seamless_wallet" | "transfer_wallet";

export interface ProviderOnboardingRecord {
  id: string;
  tenantId: string;
  providerId: string;
  stage: "contract" | "credentials" | "game_sync" | "health_test" | "approval" | "active";
  completedStages: string[];
  notes?: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProviderCredential {
  id: string;
  tenantId: string;
  providerId: string;
  environment: "sandbox" | "production";
  secretReference: string;
  callbackSecret?: string;
  ipAllowlist: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProviderHealthSnapshot {
  providerId: string;
  tenantId: string;
  status: "ok" | "degraded" | "down";
  latencyMs: number;
  errorRate: number;
  checkedAt: string;
  details?: Record<string, unknown>;
}

export interface ProviderIncident {
  id: string;
  tenantId: string;
  providerId: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "investigating" | "resolved" | "post_mortem";
  startedAt: string;
  resolvedAt?: string;
  impactedOperators: string[];
  rootCause?: string;
  resolution?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GameSyncDiff {
  id: string;
  jobId: string;
  providerId: string;
  tenantId: string;
  externalGameId: string;
  gameId?: string;
  changeType: "new" | "updated" | "removed";
  previousData?: Record<string, unknown>;
  newData?: Record<string, unknown>;
  approved: boolean;
  approvedBy?: string;
  createdAt: string;
}

// ─── Inputs ────────────────────────────────────────────────────────────────

export interface TriggerGameSyncInput {
  tenantId: string;
  providerId: string;
  providerCode: string;
  forceFullSync?: boolean;
}

export interface CreateIncidentInput {
  tenantId: string;
  providerId: string;
  title: string;
  description: string;
  severity: ProviderIncident["severity"];
  impactedOperators?: string[];
}

export interface AddCredentialInput {
  tenantId: string;
  providerId: string;
  environment: ProviderCredential["environment"];
  secretReference: string;
  callbackSecret?: string;
  ipAllowlist?: string[];
}

// ─── DB Client ────────────────────────────────────────────────────────────────

export interface ProviderServiceDatabaseClient {
  providerOnboarding: {
    findUnique(args: { where: { providerId: string } }): Promise<ProviderOnboardingRecord | null>;
    create(args: { data: ProviderOnboardingRecord }): Promise<ProviderOnboardingRecord>;
    update(args: { where: { id: string }; data: Partial<ProviderOnboardingRecord> }): Promise<ProviderOnboardingRecord>;
  };
  providerCredential: {
    findMany(args: { where: Record<string, unknown> }): Promise<ProviderCredential[]>;
    create(args: { data: ProviderCredential }): Promise<ProviderCredential>;
    update(args: { where: { id: string }; data: Partial<ProviderCredential> }): Promise<ProviderCredential>;
  };
  providerHealthSnapshot: {
    create(args: { data: ProviderHealthSnapshot }): Promise<ProviderHealthSnapshot>;
    findMany(args: { where: Record<string, unknown>; orderBy?: Record<string, unknown>; take?: number }): Promise<ProviderHealthSnapshot[]>;
  };
  providerIncident: {
    findUnique(args: { where: { id: string } }): Promise<ProviderIncident | null>;
    findMany(args: { where: Record<string, unknown>; orderBy?: Record<string, unknown> }): Promise<ProviderIncident[]>;
    create(args: { data: ProviderIncident }): Promise<ProviderIncident>;
    update(args: { where: { id: string }; data: Partial<ProviderIncident> }): Promise<ProviderIncident>;
  };
  gameSyncDiff: {
    create(args: { data: GameSyncDiff }): Promise<GameSyncDiff>;
    findMany(args: { where: Record<string, unknown> }): Promise<GameSyncDiff[]>;
    update(args: { where: { id: string }; data: Partial<GameSyncDiff> }): Promise<GameSyncDiff>;
  };
  auditLog: { create(args: { data: Record<string, unknown> }): Promise<void> };
  outboxEvent: { create(args: { data: Record<string, unknown> }): Promise<void> };
  $transaction<T>(fn: (tx: ProviderServiceDatabaseClient) => Promise<T>): Promise<T>;
}

// ─── Provider Service ─────────────────────────────────────────────────────────

export class ProviderService {
  constructor(
    private readonly db: ProviderServiceDatabaseClient,
    private readonly adapterRegistry: ProviderAdapterRegistry
  ) {}

  async addCredential(input: AddCredentialInput, actor: ActorContext, requestId: string): Promise<ProviderCredential> {
    const now = new Date().toISOString();
    return this.db.$transaction(async (tx) => {
      const credential = await tx.providerCredential.create({
        data: {
          id: crypto.randomUUID(),
          tenantId: input.tenantId,
          providerId: input.providerId,
          environment: input.environment,
          secretReference: input.secretReference,
          callbackSecret: input.callbackSecret,
          ipAllowlist: input.ipAllowlist ?? [],
          isActive: true,
          createdAt: now,
          updatedAt: now
        }
      });

      const audit = createAuditEvent({ requestId, actor, action: "create", entityType: "ProviderCredential", entityId: credential.id });
      await tx.auditLog.create({ data: { ...audit, tenantId: input.tenantId } });
      return credential;
    });
  }

  async runHealthCheck(tenantId: string, providerId: string, providerCode: string): Promise<ProviderHealthSnapshot> {
    const adapter = this.adapterRegistry.get(providerCode);
    let snapshot: ProviderHealthSnapshot;

    if (adapter) {
      const result = await adapter.healthCheck();
      snapshot = {
        providerId,
        tenantId,
        status: result.status,
        latencyMs: result.latencyMs,
        errorRate: result.errorRate ?? 0,
        checkedAt: result.checkedAt,
        details: result.details
      };
    } else {
      snapshot = {
        providerId,
        tenantId,
        status: "down",
        latencyMs: 0,
        errorRate: 1,
        checkedAt: new Date().toISOString(),
        details: { error: "No adapter registered" }
      };
    }

    await this.db.providerHealthSnapshot.create({ data: snapshot });
    return snapshot;
  }

  async triggerGameSync(input: TriggerGameSyncInput, actor: ActorContext, requestId: string): Promise<GameSyncDiff[]> {
    const adapter = this.adapterRegistry.get(input.providerCode);
    if (!adapter) throw new Error(`No adapter for provider: ${input.providerCode}`);

    const syncResult = await adapter.syncGames();
    const now = new Date().toISOString();
    const jobId = crypto.randomUUID();
    const diffs: GameSyncDiff[] = [];

    for (const game of syncResult.games) {
      const diff = await this.db.gameSyncDiff.create({
        data: {
          id: crypto.randomUUID(),
          jobId,
          providerId: input.providerId,
          tenantId: input.tenantId,
          externalGameId: game.externalId,
          changeType: "new",
          newData: game as unknown as Record<string, unknown>,
          approved: false,
          createdAt: now
        }
      });
      diffs.push(diff);
    }

    const audit = createAuditEvent({ requestId, actor, action: "create", entityType: "GameSyncJob", entityId: jobId });
    await this.db.auditLog.create({ data: { ...audit, tenantId: input.tenantId } });

    return diffs;
  }

  async createIncident(input: CreateIncidentInput, actor: ActorContext, requestId: string): Promise<ProviderIncident> {
    const now = new Date().toISOString();
    return this.db.$transaction(async (tx) => {
      const incident = await tx.providerIncident.create({
        data: {
          id: crypto.randomUUID(),
          tenantId: input.tenantId,
          providerId: input.providerId,
          title: input.title,
          description: input.description,
          severity: input.severity,
          status: "open",
          startedAt: now,
          impactedOperators: input.impactedOperators ?? [],
          createdAt: now,
          updatedAt: now
        }
      });

      await tx.outboxEvent.create({
        data: {
          id: crypto.randomUUID(), tenantId: input.tenantId, name: "provider.incident_created",
          aggregateType: "ProviderIncident", aggregateId: incident.id,
          payload: { incidentId: incident.id, providerId: input.providerId, severity: input.severity },
          schemaVersion: 1, status: "PENDING", attempts: 0, createdAt: now, updatedAt: now
        }
      });

      return incident;
    });
  }

  async getHealthHistory(tenantId: string, providerId: string, limit = 20): Promise<ProviderHealthSnapshot[]> {
    return this.db.providerHealthSnapshot.findMany({
      where: { tenantId, providerId },
      orderBy: { checkedAt: "desc" } as Record<string, unknown>,
      take: limit
    });
  }

  async listOpenIncidents(tenantId: string): Promise<ProviderIncident[]> {
    return this.db.providerIncident.findMany({
      where: { tenantId, status: { in: ["open", "investigating"] } as unknown as string },
      orderBy: { severity: "asc" } as Record<string, unknown>
    });
  }
}
