import { createDomainEvent, type DomainEvent } from "@visionesoft/platform-core";
import type { ActorContext } from "@visionesoft/shared-types";
import { createHash } from "node:crypto";

export type ProviderStatus = "draft" | "active" | "suspended" | "archived";

export interface ProviderRecord {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  status: ProviderStatus;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProviderInput {
  code: string;
  name: string;
  metadata?: Record<string, unknown>;
}

export interface ProviderContractRecord {
  id: string;
  tenantId: string;
  providerId: string;
  name: string;
  status: ProviderStatus;
  startsAt: string;
  endsAt?: string;
  commercial: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProviderContractInput {
  name: string;
  startsAt: string;
  endsAt?: string;
  commercial: Record<string, unknown>;
}

export interface ProviderPricingRecord {
  id: string;
  tenantId: string;
  providerId: string;
  currency: string;
  buyBps: number;
  minFee?: string;
  maxFee?: string;
  effectiveAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProviderPricingInput {
  currency: string;
  buyBps: number;
  minFee?: string;
  maxFee?: string;
  effectiveAt: string;
}

export interface ProviderHealthRecord {
  id: string;
  tenantId: string;
  providerId: string;
  status: string;
  latencyMs?: number;
  errorRate?: string;
  checkedAt: string;
  details?: Record<string, unknown>;
}

export interface RecordProviderHealthInput {
  status: string;
  latencyMs?: number;
  errorRate?: string;
  checkedAt?: string;
  details?: Record<string, unknown>;
}

export interface ProviderListQuery {
  tenantId: string;
  status?: ProviderStatus;
  limit: number;
  cursor?: string;
}

export interface ProviderMutationContext {
  actor: ActorContext;
  requestId: string;
  idempotencyKey: string;
}

export class ProviderServiceError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string
  ) {
    super(message);
  }
}

interface RawProvider {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  status: string;
  metadata: unknown;
  createdAt: Date;
  updatedAt: Date;
}

interface RawProviderContract {
  id: string;
  tenantId: string;
  providerId: string;
  name: string;
  status: string;
  startsAt: Date;
  endsAt: Date | null;
  commercial: unknown;
  createdAt: Date;
  updatedAt: Date;
}

interface RawProviderPricing {
  id: string;
  tenantId: string;
  providerId: string;
  currency: string;
  buyBps: number;
  minFee: { toString(): string } | string | number | null;
  maxFee: { toString(): string } | string | number | null;
  effectiveAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface RawProviderHealth {
  id: string;
  tenantId: string;
  providerId: string;
  status: string;
  latencyMs: number | null;
  errorRate: { toString(): string } | string | number | null;
  checkedAt: Date;
  details: unknown;
}

interface ProviderCreateArgs {
  data: {
    tenantId: string;
    code: string;
    name: string;
    metadata?: Record<string, unknown>;
  };
}

interface ProviderContractCreateArgs {
  data: {
    tenantId: string;
    providerId: string;
    name: string;
    startsAt: Date;
    endsAt?: Date;
    commercial: Record<string, unknown>;
  };
}

interface ProviderContractFindManyArgs {
  where: {
    tenantId: string;
    providerId: string;
  };
  orderBy: {
    startsAt: "asc" | "desc";
  };
  take: number;
}

interface ProviderPricingCreateArgs {
  data: {
    tenantId: string;
    providerId: string;
    currency: string;
    buyBps: number;
    minFee?: string;
    maxFee?: string;
    effectiveAt: Date;
  };
}

interface ProviderPricingFindManyArgs {
  where: {
    tenantId: string;
    providerId: string;
    currency?: string;
  };
  orderBy: {
    effectiveAt: "asc" | "desc";
  };
  take: number;
}

interface ProviderHealthCreateArgs {
  data: {
    tenantId: string;
    providerId: string;
    status: string;
    latencyMs?: number;
    errorRate?: string;
    checkedAt: Date;
    details?: Record<string, unknown>;
  };
}

interface ProviderHealthFindManyArgs {
  where: {
    tenantId: string;
    providerId: string;
  };
  orderBy: {
    checkedAt: "asc" | "desc";
  };
  take: number;
}

interface ProviderFindManyArgs {
  where: {
    tenantId: string;
    status?: string;
  };
  orderBy: {
    createdAt: "asc" | "desc";
  };
  take: number;
  cursor?: {
    id: string;
  };
  skip?: number;
}

interface ProviderFindUniqueArgs {
  where: {
    id: string;
  };
}

interface AuditCreateArgs {
  data: {
    tenantId: string;
    actorId?: string;
    entityType: string;
    entityId: string;
    action: string;
    reason?: string;
    diff?: Record<string, unknown>;
    requestId: string;
  };
}

interface OutboxCreateArgs {
  data: {
    tenantId: string;
    name: string;
    aggregateType: string;
    aggregateId: string;
    payload: Record<string, unknown>;
    schemaVersion: number;
  };
}

interface IdempotencyCreateArgs {
  data: {
    tenantId: string;
    key: string;
    requestHash: string;
    status: "PROCESSING";
    lockedUntil: Date;
  };
}

interface IdempotencyFindUniqueArgs {
  where: {
    tenantId_key: {
      tenantId: string;
      key: string;
    };
  };
}

interface IdempotencyUpdateArgs {
  where: {
    tenantId_key: {
      tenantId: string;
      key: string;
    };
  };
  data: {
    status: "COMPLETED" | "FAILED";
    responseHash?: string;
    responseBody?: unknown;
  };
}

interface ProviderTransactionClient {
  provider: {
    create(args: ProviderCreateArgs): Promise<RawProvider>;
    findUnique(args: ProviderFindUniqueArgs): Promise<RawProvider | null>;
  };
  providerContract: {
    create(args: ProviderContractCreateArgs): Promise<RawProviderContract>;
  };
  providerPricing: {
    create(args: ProviderPricingCreateArgs): Promise<RawProviderPricing>;
  };
  providerHealth: {
    create(args: ProviderHealthCreateArgs): Promise<RawProviderHealth>;
  };
  auditLog: {
    create(args: AuditCreateArgs): Promise<unknown>;
  };
  outboxEvent: {
    create(args: OutboxCreateArgs): Promise<unknown>;
  };
  idempotencyKey: {
    findUnique(args: IdempotencyFindUniqueArgs): Promise<{
      requestHash: string;
      status: "PROCESSING" | "COMPLETED" | "FAILED";
      responseBody: unknown;
    } | null>;
    create(args: IdempotencyCreateArgs): Promise<unknown>;
    update(args: IdempotencyUpdateArgs): Promise<unknown>;
  };
}

export interface ProviderDatabaseClient {
  provider: {
    findMany(args: ProviderFindManyArgs): Promise<RawProvider[]>;
    findUnique(args: ProviderFindUniqueArgs): Promise<RawProvider | null>;
  };
  providerContract: {
    findMany(args: ProviderContractFindManyArgs): Promise<RawProviderContract[]>;
  };
  providerPricing: {
    findMany(args: ProviderPricingFindManyArgs): Promise<RawProviderPricing[]>;
  };
  providerHealth: {
    findMany(args: ProviderHealthFindManyArgs): Promise<RawProviderHealth[]>;
  };
  $transaction<T>(operation: (tx: ProviderTransactionClient) => Promise<T>): Promise<T>;
}

export class ProviderRepository {
  constructor(private readonly db: ProviderDatabaseClient) {}

  async list(query: ProviderListQuery): Promise<ProviderRecord[]> {
    const providers = await this.db.provider.findMany({
      where: {
        tenantId: query.tenantId,
        ...(query.status ? { status: toDbStatus(query.status) } : {})
      },
      orderBy: {
        createdAt: "desc"
      },
      take: Math.min(Math.max(query.limit, 1), 100),
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {})
    });

    return providers.map(toProviderRecord);
  }

  async getById(tenantId: string, id: string): Promise<ProviderRecord | undefined> {
    const provider = await this.db.provider.findUnique({
      where: { id }
    });

    if (!provider || provider.tenantId !== tenantId) {
      return undefined;
    }

    return toProviderRecord(provider);
  }

  async create(context: ProviderMutationContext, input: CreateProviderInput): Promise<ProviderRecord> {
    const tenantId = context.actor.scope.tenantId;
    const validatedInput = validateCreateProviderInput(input);
    const requestHash = stableHash({
      code: validatedInput.code,
      name: validatedInput.name,
      metadata: validatedInput.metadata ?? {}
    });

    return this.db.$transaction(async (tx) => {
      const existingIdempotency = await tx.idempotencyKey.findUnique({
        where: {
          tenantId_key: {
            tenantId,
            key: context.idempotencyKey
          }
        }
      });

      if (existingIdempotency) {
        if (existingIdempotency.requestHash !== requestHash) {
          throw new ProviderServiceError(
            409,
            "idempotency_key_reused_with_different_body",
            "Idempotency key was already used with a different request body"
          );
        }

        if (existingIdempotency.status === "COMPLETED" && isProviderRecord(existingIdempotency.responseBody)) {
          return existingIdempotency.responseBody;
        }

        throw new ProviderServiceError(409, "idempotent_request_processing", "Idempotent request is already processing");
      }

      await tx.idempotencyKey.create({
        data: {
          tenantId,
          key: context.idempotencyKey,
          requestHash,
          status: "PROCESSING",
          lockedUntil: new Date(Date.now() + 10 * 60 * 1000)
        }
      });

      const provider = await tx.provider.create({
        data: {
          tenantId,
          code: validatedInput.code,
          name: validatedInput.name,
          ...(validatedInput.metadata ? { metadata: validatedInput.metadata } : {})
        }
      });
      const record = toProviderRecord(provider);
      const event = createProviderCreatedEvent(record);

      await tx.auditLog.create({
        data: {
          tenantId,
          actorId: context.actor.actorId,
          entityType: "Provider",
          entityId: record.id,
          action: "create",
          reason: "provider_created",
          diff: {
            after: record
          },
          requestId: context.requestId
        }
      });

      await tx.outboxEvent.create({
        data: {
          tenantId,
          name: event.name,
          aggregateType: event.aggregateType,
          aggregateId: event.aggregateId,
          payload: event.payload,
          schemaVersion: event.schemaVersion
        }
      });

      await tx.idempotencyKey.update({
        where: {
          tenantId_key: {
            tenantId,
            key: context.idempotencyKey
          }
        },
        data: {
          status: "COMPLETED",
          responseHash: stableHash(record),
          responseBody: record
        }
      });

      return record;
    });
  }

  async listContracts(tenantId: string, providerId: string, limit = 50): Promise<ProviderContractRecord[]> {
    await this.requireProvider(tenantId, providerId);
    const contracts = await this.db.providerContract.findMany({
      where: {
        tenantId,
        providerId
      },
      orderBy: {
        startsAt: "desc"
      },
      take: Math.min(Math.max(limit, 1), 100)
    });

    return contracts.map(toProviderContractRecord);
  }

  async createContract(
    context: ProviderMutationContext,
    providerId: string,
    input: CreateProviderContractInput
  ): Promise<ProviderContractRecord> {
    const tenantId = context.actor.scope.tenantId;
    const validatedInput = validateCreateProviderContractInput(input);

    return this.executeIdempotentMutation(context, "ProviderContract", "provider.contract.created", {
      providerId,
      input: validatedInput
    }, async (tx) => {
      await requireProviderInTransaction(tx, tenantId, providerId);

      const contract = await tx.providerContract.create({
        data: {
          tenantId,
          providerId,
          name: validatedInput.name,
          startsAt: new Date(validatedInput.startsAt),
          ...(validatedInput.endsAt ? { endsAt: new Date(validatedInput.endsAt) } : {}),
          commercial: validatedInput.commercial
        }
      });

      return toProviderContractRecord(contract);
    });
  }

  async listPricing(tenantId: string, providerId: string, currency?: string, limit = 50): Promise<ProviderPricingRecord[]> {
    await this.requireProvider(tenantId, providerId);
    const pricing = await this.db.providerPricing.findMany({
      where: {
        tenantId,
        providerId,
        ...(currency ? { currency: normalizeCurrency(currency) } : {})
      },
      orderBy: {
        effectiveAt: "desc"
      },
      take: Math.min(Math.max(limit, 1), 100)
    });

    return pricing.map(toProviderPricingRecord);
  }

  async createPricing(
    context: ProviderMutationContext,
    providerId: string,
    input: CreateProviderPricingInput
  ): Promise<ProviderPricingRecord> {
    const tenantId = context.actor.scope.tenantId;
    const validatedInput = validateCreateProviderPricingInput(input);

    return this.executeIdempotentMutation(context, "ProviderPricing", "provider.pricing.created", {
      providerId,
      input: validatedInput
    }, async (tx) => {
      await requireProviderInTransaction(tx, tenantId, providerId);

      const pricing = await tx.providerPricing.create({
        data: {
          tenantId,
          providerId,
          currency: validatedInput.currency,
          buyBps: validatedInput.buyBps,
          ...(validatedInput.minFee ? { minFee: validatedInput.minFee } : {}),
          ...(validatedInput.maxFee ? { maxFee: validatedInput.maxFee } : {}),
          effectiveAt: new Date(validatedInput.effectiveAt)
        }
      });

      return toProviderPricingRecord(pricing);
    });
  }

  async listHealth(tenantId: string, providerId: string, limit = 50): Promise<ProviderHealthRecord[]> {
    await this.requireProvider(tenantId, providerId);
    const health = await this.db.providerHealth.findMany({
      where: {
        tenantId,
        providerId
      },
      orderBy: {
        checkedAt: "desc"
      },
      take: Math.min(Math.max(limit, 1), 100)
    });

    return health.map(toProviderHealthRecord);
  }

  async recordHealth(
    context: ProviderMutationContext,
    providerId: string,
    input: RecordProviderHealthInput
  ): Promise<ProviderHealthRecord> {
    const tenantId = context.actor.scope.tenantId;
    const validatedInput = validateRecordProviderHealthInput(input);

    return this.executeIdempotentMutation(context, "ProviderHealth", "provider.health.recorded", {
      providerId,
      input: validatedInput
    }, async (tx) => {
      await requireProviderInTransaction(tx, tenantId, providerId);

      const health = await tx.providerHealth.create({
        data: {
          tenantId,
          providerId,
          status: validatedInput.status,
          ...(validatedInput.latencyMs !== undefined ? { latencyMs: validatedInput.latencyMs } : {}),
          ...(validatedInput.errorRate ? { errorRate: validatedInput.errorRate } : {}),
          checkedAt: new Date(validatedInput.checkedAt ?? new Date().toISOString()),
          ...(validatedInput.details ? { details: validatedInput.details } : {})
        }
      });

      return toProviderHealthRecord(health);
    });
  }

  private async requireProvider(tenantId: string, providerId: string): Promise<ProviderRecord> {
    const provider = await this.getById(tenantId, providerId);

    if (!provider) {
      throw new ProviderServiceError(404, "provider_not_found", "Provider not found");
    }

    return provider;
  }

  private async executeIdempotentMutation<TRecord extends { id: string; tenantId: string }>(
    context: ProviderMutationContext,
    entityType: string,
    eventName: DomainEvent["name"],
    requestPayload: Record<string, unknown>,
    operation: (tx: ProviderTransactionClient) => Promise<TRecord>
  ): Promise<TRecord> {
    const tenantId = context.actor.scope.tenantId;
    const requestHash = stableHash(requestPayload);

    return this.db.$transaction(async (tx) => {
      const existingIdempotency = await tx.idempotencyKey.findUnique({
        where: {
          tenantId_key: {
            tenantId,
            key: context.idempotencyKey
          }
        }
      });

      if (existingIdempotency) {
        if (existingIdempotency.requestHash !== requestHash) {
          throw new ProviderServiceError(
            409,
            "idempotency_key_reused_with_different_body",
            "Idempotency key was already used with a different request body"
          );
        }

        if (existingIdempotency.status === "COMPLETED" && isRecordWithTenant(existingIdempotency.responseBody)) {
          return existingIdempotency.responseBody as TRecord;
        }

        throw new ProviderServiceError(409, "idempotent_request_processing", "Idempotent request is already processing");
      }

      await tx.idempotencyKey.create({
        data: {
          tenantId,
          key: context.idempotencyKey,
          requestHash,
          status: "PROCESSING",
          lockedUntil: new Date(Date.now() + 10 * 60 * 1000)
        }
      });

      const record = await operation(tx);
      const event = createDomainEvent({
        name: eventName,
        aggregateType: entityType,
        aggregateId: record.id,
        tenantId,
        payload: record
      });

      await tx.auditLog.create({
        data: {
          tenantId,
          actorId: context.actor.actorId,
          entityType,
          entityId: record.id,
          action: "create",
          reason: `${entityType.toLowerCase()}_created`,
          diff: {
            after: record
          },
          requestId: context.requestId
        }
      });

      await tx.outboxEvent.create({
        data: {
          tenantId,
          name: event.name,
          aggregateType: event.aggregateType,
          aggregateId: event.aggregateId,
          payload: event.payload,
          schemaVersion: event.schemaVersion
        }
      });

      await tx.idempotencyKey.update({
        where: {
          tenantId_key: {
            tenantId,
            key: context.idempotencyKey
          }
        },
        data: {
          status: "COMPLETED",
          responseHash: stableHash(record),
          responseBody: record
        }
      });

      return record;
    });
  }
}

export function normalizeProviderCode(code: string): string {
  const normalized = code.trim().toUpperCase().replace(/[^A-Z0-9_]/g, "_");

  if (normalized.length < 2 || normalized.length > 64) {
    throw new ProviderServiceError(400, "invalid_provider_code", "Provider code must be 2-64 characters after normalization");
  }

  return normalized;
}

export function validateCreateProviderInput(input: unknown): CreateProviderInput {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new ProviderServiceError(400, "invalid_provider_payload", "Provider payload must be an object");
  }

  const candidate = input as Partial<CreateProviderInput>;

  if (typeof candidate.code !== "string") {
    throw new ProviderServiceError(400, "invalid_provider_code", "Provider code is required");
  }

  if (typeof candidate.name !== "string") {
    throw new ProviderServiceError(400, "invalid_provider_name", "Provider name is required");
  }

  if (candidate.metadata !== undefined && !isMetadata(candidate.metadata)) {
    throw new ProviderServiceError(400, "invalid_provider_metadata", "Provider metadata must be an object");
  }

  const name = candidate.name.trim();

  if (name.length < 2 || name.length > 160) {
    throw new ProviderServiceError(400, "invalid_provider_name", "Provider name must be 2-160 characters");
  }

  return {
    code: normalizeProviderCode(candidate.code),
    name,
    ...(candidate.metadata ? { metadata: candidate.metadata } : {})
  };
}

export function validateCreateProviderContractInput(input: unknown): CreateProviderContractInput {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new ProviderServiceError(400, "invalid_provider_contract_payload", "Provider contract payload must be an object");
  }

  const candidate = input as Partial<CreateProviderContractInput>;

  if (typeof candidate.name !== "string" || candidate.name.trim().length < 2 || candidate.name.trim().length > 160) {
    throw new ProviderServiceError(400, "invalid_provider_contract_name", "Provider contract name must be 2-160 characters");
  }

  if (typeof candidate.startsAt !== "string" || Number.isNaN(Date.parse(candidate.startsAt))) {
    throw new ProviderServiceError(400, "invalid_provider_contract_start", "Provider contract startsAt must be an ISO date");
  }

  if (candidate.endsAt !== undefined && (typeof candidate.endsAt !== "string" || Number.isNaN(Date.parse(candidate.endsAt)))) {
    throw new ProviderServiceError(400, "invalid_provider_contract_end", "Provider contract endsAt must be an ISO date");
  }

  if (!isMetadata(candidate.commercial)) {
    throw new ProviderServiceError(400, "invalid_provider_contract_commercial", "Provider contract commercial terms must be an object");
  }

  return {
    name: candidate.name.trim(),
    startsAt: new Date(candidate.startsAt).toISOString(),
    ...(candidate.endsAt ? { endsAt: new Date(candidate.endsAt).toISOString() } : {}),
    commercial: candidate.commercial
  };
}

export function validateCreateProviderPricingInput(input: unknown): CreateProviderPricingInput {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new ProviderServiceError(400, "invalid_provider_pricing_payload", "Provider pricing payload must be an object");
  }

  const candidate = input as Partial<CreateProviderPricingInput>;

  if (typeof candidate.currency !== "string") {
    throw new ProviderServiceError(400, "invalid_provider_pricing_currency", "Currency is required");
  }

  const buyBps = candidate.buyBps;

  if (typeof buyBps !== "number" || !Number.isInteger(buyBps) || buyBps < 0 || buyBps > 10000) {
    throw new ProviderServiceError(400, "invalid_provider_pricing_buy_bps", "buyBps must be an integer from 0 to 10000");
  }

  if (typeof candidate.effectiveAt !== "string" || Number.isNaN(Date.parse(candidate.effectiveAt))) {
    throw new ProviderServiceError(400, "invalid_provider_pricing_effective_at", "effectiveAt must be an ISO date");
  }

  return {
    currency: normalizeCurrency(candidate.currency),
    buyBps,
    ...(candidate.minFee !== undefined ? { minFee: normalizeDecimalString(candidate.minFee, "minFee") } : {}),
    ...(candidate.maxFee !== undefined ? { maxFee: normalizeDecimalString(candidate.maxFee, "maxFee") } : {}),
    effectiveAt: new Date(candidate.effectiveAt).toISOString()
  };
}

export function validateRecordProviderHealthInput(input: unknown): RecordProviderHealthInput {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new ProviderServiceError(400, "invalid_provider_health_payload", "Provider health payload must be an object");
  }

  const candidate = input as Partial<RecordProviderHealthInput>;

  if (typeof candidate.status !== "string" || candidate.status.trim().length < 2 || candidate.status.trim().length > 64) {
    throw new ProviderServiceError(400, "invalid_provider_health_status", "Provider health status must be 2-64 characters");
  }

  if (candidate.latencyMs !== undefined && (!Number.isInteger(candidate.latencyMs) || candidate.latencyMs < 0)) {
    throw new ProviderServiceError(400, "invalid_provider_health_latency", "latencyMs must be a non-negative integer");
  }

  if (candidate.errorRate !== undefined) {
    normalizeDecimalString(candidate.errorRate, "errorRate");
  }

  if (candidate.checkedAt !== undefined && (typeof candidate.checkedAt !== "string" || Number.isNaN(Date.parse(candidate.checkedAt)))) {
    throw new ProviderServiceError(400, "invalid_provider_health_checked_at", "checkedAt must be an ISO date");
  }

  if (candidate.details !== undefined && !isMetadata(candidate.details)) {
    throw new ProviderServiceError(400, "invalid_provider_health_details", "Provider health details must be an object");
  }

  return {
    status: candidate.status.trim().toLowerCase(),
    ...(candidate.latencyMs !== undefined ? { latencyMs: candidate.latencyMs } : {}),
    ...(candidate.errorRate !== undefined ? { errorRate: normalizeDecimalString(candidate.errorRate, "errorRate") } : {}),
    ...(candidate.checkedAt ? { checkedAt: new Date(candidate.checkedAt).toISOString() } : {}),
    ...(candidate.details ? { details: candidate.details } : {})
  };
}

function createProviderCreatedEvent(provider: ProviderRecord): DomainEvent {
  return createDomainEvent({
    name: "provider.created",
    aggregateType: "Provider",
    aggregateId: provider.id,
    tenantId: provider.tenantId,
    payload: {
      id: provider.id,
      code: provider.code,
      name: provider.name,
      status: provider.status
    }
  });
}

function toProviderRecord(provider: RawProvider): ProviderRecord {
  const record: ProviderRecord = {
    id: provider.id,
    tenantId: provider.tenantId,
    code: provider.code,
    name: provider.name,
    status: fromDbStatus(provider.status),
    createdAt: provider.createdAt.toISOString(),
    updatedAt: provider.updatedAt.toISOString()
  };

  if (isMetadata(provider.metadata)) {
    record.metadata = provider.metadata;
  }

  return record;
}

function toProviderContractRecord(contract: RawProviderContract): ProviderContractRecord {
  const record: ProviderContractRecord = {
    id: contract.id,
    tenantId: contract.tenantId,
    providerId: contract.providerId,
    name: contract.name,
    status: fromDbStatus(contract.status),
    startsAt: contract.startsAt.toISOString(),
    commercial: isMetadata(contract.commercial) ? contract.commercial : {},
    createdAt: contract.createdAt.toISOString(),
    updatedAt: contract.updatedAt.toISOString()
  };

  if (contract.endsAt) {
    record.endsAt = contract.endsAt.toISOString();
  }

  return record;
}

function toProviderPricingRecord(pricing: RawProviderPricing): ProviderPricingRecord {
  const record: ProviderPricingRecord = {
    id: pricing.id,
    tenantId: pricing.tenantId,
    providerId: pricing.providerId,
    currency: pricing.currency,
    buyBps: pricing.buyBps,
    effectiveAt: pricing.effectiveAt.toISOString(),
    createdAt: pricing.createdAt.toISOString(),
    updatedAt: pricing.updatedAt.toISOString()
  };

  if (pricing.minFee !== null) {
    record.minFee = pricing.minFee.toString();
  }

  if (pricing.maxFee !== null) {
    record.maxFee = pricing.maxFee.toString();
  }

  return record;
}

function toProviderHealthRecord(health: RawProviderHealth): ProviderHealthRecord {
  const record: ProviderHealthRecord = {
    id: health.id,
    tenantId: health.tenantId,
    providerId: health.providerId,
    status: health.status,
    checkedAt: health.checkedAt.toISOString()
  };

  if (health.latencyMs !== null) {
    record.latencyMs = health.latencyMs;
  }

  if (health.errorRate !== null) {
    record.errorRate = health.errorRate.toString();
  }

  if (isMetadata(health.details)) {
    record.details = health.details;
  }

  return record;
}

function fromDbStatus(status: string): ProviderStatus {
  switch (status) {
    case "ACTIVE":
      return "active";
    case "SUSPENDED":
      return "suspended";
    case "ARCHIVED":
      return "archived";
    default:
      return "draft";
  }
}

function toDbStatus(status: ProviderStatus): string {
  return status.toUpperCase();
}

async function requireProviderInTransaction(tx: ProviderTransactionClient, tenantId: string, providerId: string): Promise<RawProvider> {
  const provider = await tx.provider.findUnique({
    where: {
      id: providerId
    }
  });

  if (!provider || provider.tenantId !== tenantId) {
    throw new ProviderServiceError(404, "provider_not_found", "Provider not found");
  }

  return provider;
}

function normalizeCurrency(currency: string): string {
  const normalized = currency.trim().toUpperCase();

  if (!/^[A-Z0-9]{3,12}$/.test(normalized)) {
    throw new ProviderServiceError(400, "invalid_currency", "Currency must be 3-12 uppercase letters or numbers");
  }

  return normalized;
}

function normalizeDecimalString(value: unknown, fieldName: string): string {
  if (typeof value !== "string" && typeof value !== "number") {
    throw new ProviderServiceError(400, `invalid_${fieldName}`, `${fieldName} must be numeric`);
  }

  const normalized = String(value);

  if (!/^\d+(\.\d{1,6})?$/.test(normalized)) {
    throw new ProviderServiceError(400, `invalid_${fieldName}`, `${fieldName} must be a decimal with up to 6 fractional digits`);
  }

  return normalized;
}

function isMetadata(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isProviderRecord(value: unknown): value is ProviderRecord {
  return Boolean(value) &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    typeof (value as ProviderRecord).id === "string" &&
    typeof (value as ProviderRecord).tenantId === "string" &&
    typeof (value as ProviderRecord).code === "string" &&
    typeof (value as ProviderRecord).name === "string";
}

function isRecordWithTenant(value: unknown): value is { id: string; tenantId: string } {
  return Boolean(value) &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    typeof (value as { id?: unknown }).id === "string" &&
    typeof (value as { tenantId?: unknown }).tenantId === "string";
}

function stableHash(value: unknown): string {
  return createHash("sha256")
    .update(JSON.stringify(sortObject(value)))
    .digest("hex");
}

function sortObject(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortObject);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nestedValue]) => [key, sortObject(nestedValue)])
    );
  }

  return value;
}
