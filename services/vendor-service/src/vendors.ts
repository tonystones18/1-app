import { createDomainEvent, type DomainEvent } from "@visionesoft/platform-core";
import type { ActorContext } from "@visionesoft/shared-types";
import { createHash } from "node:crypto";

export type VendorStatus = "draft" | "active" | "suspended" | "archived";

export interface VendorRecord {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  status: VendorStatus;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVendorInput {
  code: string;
  name: string;
  metadata?: Record<string, unknown>;
}

export interface VendorContractRecord {
  id: string;
  tenantId: string;
  vendorId: string;
  name: string;
  status: VendorStatus;
  startsAt: string;
  endsAt?: string;
  commercial: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVendorContractInput {
  name: string;
  startsAt: string;
  endsAt?: string;
  commercial: Record<string, unknown>;
}

export interface VendorPricingRecord {
  id: string;
  tenantId: string;
  vendorId: string;
  currency: string;
  sellBps: number;
  minFee?: string;
  maxFee?: string;
  effectiveAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVendorPricingInput {
  currency: string;
  sellBps: number;
  minFee?: string;
  maxFee?: string;
  effectiveAt: string;
}

export interface VendorListQuery {
  tenantId: string;
  status?: VendorStatus;
  limit: number;
  cursor?: string;
}

export interface VendorMutationContext {
  actor: ActorContext;
  requestId: string;
  idempotencyKey: string;
}

export class VendorServiceError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string
  ) {
    super(message);
  }
}

interface RawVendor {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  status: string;
  metadata: unknown;
  createdAt: Date;
  updatedAt: Date;
}

interface RawVendorContract {
  id: string;
  tenantId: string;
  vendorId: string;
  name: string;
  status: string;
  startsAt: Date;
  endsAt: Date | null;
  commercial: unknown;
  createdAt: Date;
  updatedAt: Date;
}

interface RawVendorPricing {
  id: string;
  tenantId: string;
  vendorId: string;
  currency: string;
  sellBps: number;
  minFee: { toString(): string } | string | number | null;
  maxFee: { toString(): string } | string | number | null;
  effectiveAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface VendorCreateArgs {
  data: {
    tenantId: string;
    code: string;
    name: string;
    metadata?: Record<string, unknown>;
  };
}

interface VendorContractCreateArgs {
  data: {
    tenantId: string;
    vendorId: string;
    name: string;
    startsAt: Date;
    endsAt?: Date;
    commercial: Record<string, unknown>;
  };
}

interface VendorContractFindManyArgs {
  where: {
    tenantId: string;
    vendorId: string;
  };
  orderBy: {
    startsAt: "asc" | "desc";
  };
  take: number;
}

interface VendorPricingCreateArgs {
  data: {
    tenantId: string;
    vendorId: string;
    currency: string;
    sellBps: number;
    minFee?: string;
    maxFee?: string;
    effectiveAt: Date;
  };
}

interface VendorPricingFindManyArgs {
  where: {
    tenantId: string;
    vendorId: string;
    currency?: string;
  };
  orderBy: {
    effectiveAt: "asc" | "desc";
  };
  take: number;
}

interface VendorFindManyArgs {
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

interface VendorFindUniqueArgs {
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

interface VendorTransactionClient {
  vendor: {
    create(args: VendorCreateArgs): Promise<RawVendor>;
    findUnique(args: VendorFindUniqueArgs): Promise<RawVendor | null>;
  };
  vendorContract: {
    create(args: VendorContractCreateArgs): Promise<RawVendorContract>;
  };
  vendorPricing: {
    create(args: VendorPricingCreateArgs): Promise<RawVendorPricing>;
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

export interface VendorDatabaseClient {
  vendor: {
    findMany(args: VendorFindManyArgs): Promise<RawVendor[]>;
    findUnique(args: VendorFindUniqueArgs): Promise<RawVendor | null>;
  };
  vendorContract: {
    findMany(args: VendorContractFindManyArgs): Promise<RawVendorContract[]>;
  };
  vendorPricing: {
    findMany(args: VendorPricingFindManyArgs): Promise<RawVendorPricing[]>;
  };
  $transaction<T>(operation: (tx: VendorTransactionClient) => Promise<T>): Promise<T>;
}

export class VendorRepository {
  constructor(private readonly db: VendorDatabaseClient) {}

  async list(query: VendorListQuery): Promise<VendorRecord[]> {
    const vendors = await this.db.vendor.findMany({
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

    return vendors.map(toVendorRecord);
  }

  async getById(tenantId: string, id: string): Promise<VendorRecord | undefined> {
    const vendor = await this.db.vendor.findUnique({
      where: { id }
    });

    if (!vendor || vendor.tenantId !== tenantId) {
      return undefined;
    }

    return toVendorRecord(vendor);
  }

  async create(context: VendorMutationContext, input: CreateVendorInput): Promise<VendorRecord> {
    const tenantId = context.actor.scope.tenantId;
    const validatedInput = validateCreateVendorInput(input);
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
          throw new VendorServiceError(
            409,
            "idempotency_key_reused_with_different_body",
            "Idempotency key was already used with a different request body"
          );
        }

        if (existingIdempotency.status === "COMPLETED" && isVendorRecord(existingIdempotency.responseBody)) {
          return existingIdempotency.responseBody;
        }

        throw new VendorServiceError(409, "idempotent_request_processing", "Idempotent request is already processing");
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

      const vendor = await tx.vendor.create({
        data: {
          tenantId,
          code: validatedInput.code,
          name: validatedInput.name,
          ...(validatedInput.metadata ? { metadata: validatedInput.metadata } : {})
        }
      });
      const record = toVendorRecord(vendor);
      const event = createVendorCreatedEvent(record);

      await tx.auditLog.create({
        data: {
          tenantId,
          actorId: context.actor.actorId,
          entityType: "Vendor",
          entityId: record.id,
          action: "create",
          reason: "vendor_created",
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

  async listContracts(tenantId: string, vendorId: string, limit = 50): Promise<VendorContractRecord[]> {
    await this.requireVendor(tenantId, vendorId);
    const contracts = await this.db.vendorContract.findMany({
      where: {
        tenantId,
        vendorId
      },
      orderBy: {
        startsAt: "desc"
      },
      take: Math.min(Math.max(limit, 1), 100)
    });

    return contracts.map(toVendorContractRecord);
  }

  async createContract(
    context: VendorMutationContext,
    vendorId: string,
    input: CreateVendorContractInput
  ): Promise<VendorContractRecord> {
    const tenantId = context.actor.scope.tenantId;
    const validatedInput = validateCreateVendorContractInput(input);

    return this.executeIdempotentMutation(context, "VendorContract", "vendor.contract.created", {
      vendorId,
      input: validatedInput
    }, async (tx) => {
      await requireVendorInTransaction(tx, tenantId, vendorId);

      const contract = await tx.vendorContract.create({
        data: {
          tenantId,
          vendorId,
          name: validatedInput.name,
          startsAt: new Date(validatedInput.startsAt),
          ...(validatedInput.endsAt ? { endsAt: new Date(validatedInput.endsAt) } : {}),
          commercial: validatedInput.commercial
        }
      });

      return toVendorContractRecord(contract);
    });
  }

  async listPricing(tenantId: string, vendorId: string, currency?: string, limit = 50): Promise<VendorPricingRecord[]> {
    await this.requireVendor(tenantId, vendorId);
    const pricing = await this.db.vendorPricing.findMany({
      where: {
        tenantId,
        vendorId,
        ...(currency ? { currency: normalizeCurrency(currency) } : {})
      },
      orderBy: {
        effectiveAt: "desc"
      },
      take: Math.min(Math.max(limit, 1), 100)
    });

    return pricing.map(toVendorPricingRecord);
  }

  async createPricing(
    context: VendorMutationContext,
    vendorId: string,
    input: CreateVendorPricingInput
  ): Promise<VendorPricingRecord> {
    const tenantId = context.actor.scope.tenantId;
    const validatedInput = validateCreateVendorPricingInput(input);

    return this.executeIdempotentMutation(context, "VendorPricing", "vendor.pricing.created", {
      vendorId,
      input: validatedInput
    }, async (tx) => {
      await requireVendorInTransaction(tx, tenantId, vendorId);

      const pricing = await tx.vendorPricing.create({
        data: {
          tenantId,
          vendorId,
          currency: validatedInput.currency,
          sellBps: validatedInput.sellBps,
          ...(validatedInput.minFee ? { minFee: validatedInput.minFee } : {}),
          ...(validatedInput.maxFee ? { maxFee: validatedInput.maxFee } : {}),
          effectiveAt: new Date(validatedInput.effectiveAt)
        }
      });

      return toVendorPricingRecord(pricing);
    });
  }

  private async requireVendor(tenantId: string, vendorId: string): Promise<VendorRecord> {
    const vendor = await this.getById(tenantId, vendorId);

    if (!vendor) {
      throw new VendorServiceError(404, "vendor_not_found", "Vendor not found");
    }

    return vendor;
  }

  private async executeIdempotentMutation<TRecord extends { id: string; tenantId: string }>(
    context: VendorMutationContext,
    entityType: string,
    eventName: DomainEvent["name"],
    requestPayload: Record<string, unknown>,
    operation: (tx: VendorTransactionClient) => Promise<TRecord>
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
          throw new VendorServiceError(
            409,
            "idempotency_key_reused_with_different_body",
            "Idempotency key was already used with a different request body"
          );
        }

        if (existingIdempotency.status === "COMPLETED" && isRecordWithTenant(existingIdempotency.responseBody)) {
          return existingIdempotency.responseBody as TRecord;
        }

        throw new VendorServiceError(409, "idempotent_request_processing", "Idempotent request is already processing");
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

export function normalizeVendorCode(code: string): string {
  const normalized = code.trim().toUpperCase().replace(/[^A-Z0-9_]/g, "_");

  if (normalized.length < 2 || normalized.length > 64) {
    throw new VendorServiceError(400, "invalid_vendor_code", "Vendor code must be 2-64 characters after normalization");
  }

  return normalized;
}

export function validateCreateVendorInput(input: unknown): CreateVendorInput {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new VendorServiceError(400, "invalid_vendor_payload", "Vendor payload must be an object");
  }

  const candidate = input as Partial<CreateVendorInput>;

  if (typeof candidate.code !== "string") {
    throw new VendorServiceError(400, "invalid_vendor_code", "Vendor code is required");
  }

  if (typeof candidate.name !== "string") {
    throw new VendorServiceError(400, "invalid_vendor_name", "Vendor name is required");
  }

  if (candidate.metadata !== undefined && !isMetadata(candidate.metadata)) {
    throw new VendorServiceError(400, "invalid_vendor_metadata", "Vendor metadata must be an object");
  }

  const name = candidate.name.trim();

  if (name.length < 2 || name.length > 160) {
    throw new VendorServiceError(400, "invalid_vendor_name", "Vendor name must be 2-160 characters");
  }

  return {
    code: normalizeVendorCode(candidate.code),
    name,
    ...(candidate.metadata ? { metadata: candidate.metadata } : {})
  };
}

export function validateCreateVendorContractInput(input: unknown): CreateVendorContractInput {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new VendorServiceError(400, "invalid_vendor_contract_payload", "Vendor contract payload must be an object");
  }

  const candidate = input as Partial<CreateVendorContractInput>;

  if (typeof candidate.name !== "string" || candidate.name.trim().length < 2 || candidate.name.trim().length > 160) {
    throw new VendorServiceError(400, "invalid_vendor_contract_name", "Vendor contract name must be 2-160 characters");
  }

  if (typeof candidate.startsAt !== "string" || Number.isNaN(Date.parse(candidate.startsAt))) {
    throw new VendorServiceError(400, "invalid_vendor_contract_start", "Vendor contract startsAt must be an ISO date");
  }

  if (candidate.endsAt !== undefined && (typeof candidate.endsAt !== "string" || Number.isNaN(Date.parse(candidate.endsAt)))) {
    throw new VendorServiceError(400, "invalid_vendor_contract_end", "Vendor contract endsAt must be an ISO date");
  }

  if (!isMetadata(candidate.commercial)) {
    throw new VendorServiceError(400, "invalid_vendor_contract_commercial", "Vendor contract commercial terms must be an object");
  }

  return {
    name: candidate.name.trim(),
    startsAt: new Date(candidate.startsAt).toISOString(),
    ...(candidate.endsAt ? { endsAt: new Date(candidate.endsAt).toISOString() } : {}),
    commercial: candidate.commercial
  };
}

export function validateCreateVendorPricingInput(input: unknown): CreateVendorPricingInput {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new VendorServiceError(400, "invalid_vendor_pricing_payload", "Vendor pricing payload must be an object");
  }

  const candidate = input as Partial<CreateVendorPricingInput>;

  if (typeof candidate.currency !== "string") {
    throw new VendorServiceError(400, "invalid_vendor_pricing_currency", "Currency is required");
  }

  const sellBps = candidate.sellBps;

  if (typeof sellBps !== "number" || !Number.isInteger(sellBps) || sellBps < 0 || sellBps > 10000) {
    throw new VendorServiceError(400, "invalid_vendor_pricing_sell_bps", "sellBps must be an integer from 0 to 10000");
  }

  if (typeof candidate.effectiveAt !== "string" || Number.isNaN(Date.parse(candidate.effectiveAt))) {
    throw new VendorServiceError(400, "invalid_vendor_pricing_effective_at", "effectiveAt must be an ISO date");
  }

  return {
    currency: normalizeCurrency(candidate.currency),
    sellBps,
    ...(candidate.minFee !== undefined ? { minFee: normalizeDecimalString(candidate.minFee, "minFee") } : {}),
    ...(candidate.maxFee !== undefined ? { maxFee: normalizeDecimalString(candidate.maxFee, "maxFee") } : {}),
    effectiveAt: new Date(candidate.effectiveAt).toISOString()
  };
}

function createVendorCreatedEvent(vendor: VendorRecord): DomainEvent {
  return createDomainEvent({
    name: "vendor.created",
    aggregateType: "Vendor",
    aggregateId: vendor.id,
    tenantId: vendor.tenantId,
    payload: {
      id: vendor.id,
      code: vendor.code,
      name: vendor.name,
      status: vendor.status
    }
  });
}

function toVendorRecord(vendor: RawVendor): VendorRecord {
  const record: VendorRecord = {
    id: vendor.id,
    tenantId: vendor.tenantId,
    code: vendor.code,
    name: vendor.name,
    status: fromDbStatus(vendor.status),
    createdAt: vendor.createdAt.toISOString(),
    updatedAt: vendor.updatedAt.toISOString()
  };

  if (isMetadata(vendor.metadata)) {
    record.metadata = vendor.metadata;
  }

  return record;
}

function toVendorContractRecord(contract: RawVendorContract): VendorContractRecord {
  const record: VendorContractRecord = {
    id: contract.id,
    tenantId: contract.tenantId,
    vendorId: contract.vendorId,
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

function toVendorPricingRecord(pricing: RawVendorPricing): VendorPricingRecord {
  const record: VendorPricingRecord = {
    id: pricing.id,
    tenantId: pricing.tenantId,
    vendorId: pricing.vendorId,
    currency: pricing.currency,
    sellBps: pricing.sellBps,
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

function fromDbStatus(status: string): VendorStatus {
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

function toDbStatus(status: VendorStatus): string {
  return status.toUpperCase();
}

async function requireVendorInTransaction(tx: VendorTransactionClient, tenantId: string, vendorId: string): Promise<RawVendor> {
  const vendor = await tx.vendor.findUnique({
    where: {
      id: vendorId
    }
  });

  if (!vendor || vendor.tenantId !== tenantId) {
    throw new VendorServiceError(404, "vendor_not_found", "Vendor not found");
  }

  return vendor;
}

function normalizeCurrency(currency: string): string {
  const normalized = currency.trim().toUpperCase();

  if (!/^[A-Z0-9]{3,12}$/.test(normalized)) {
    throw new VendorServiceError(400, "invalid_currency", "Currency must be 3-12 uppercase letters or numbers");
  }

  return normalized;
}

function normalizeDecimalString(value: unknown, fieldName: string): string {
  if (typeof value !== "string" && typeof value !== "number") {
    throw new VendorServiceError(400, `invalid_${fieldName}`, `${fieldName} must be numeric`);
  }

  const normalized = String(value);

  if (!/^\d+(\.\d{1,6})?$/.test(normalized)) {
    throw new VendorServiceError(400, `invalid_${fieldName}`, `${fieldName} must be a decimal with up to 6 fractional digits`);
  }

  return normalized;
}

function isMetadata(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isVendorRecord(value: unknown): value is VendorRecord {
  return Boolean(value) &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    typeof (value as VendorRecord).id === "string" &&
    typeof (value as VendorRecord).tenantId === "string" &&
    typeof (value as VendorRecord).code === "string" &&
    typeof (value as VendorRecord).name === "string";
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
