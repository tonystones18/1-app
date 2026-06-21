import { createDomainEvent, type DomainEvent } from "@visionesoft/platform-core";
import type { ActorContext } from "@visionesoft/shared-types";
import { createHash } from "node:crypto";

export type RouteLifecycleStatus = "draft" | "active" | "suspended" | "archived";
export type ManagedRouteType = "game_launch" | "wallet" | "callback" | "payment";
export type ManagedRoutePriority = "primary" | "fallback" | "backup" | "emergency";

export interface RouteGroupRecord {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  status: RouteLifecycleStatus;
  createdAt: string;
  updatedAt: string;
}

export interface RoutePolicyRecord {
  id: string;
  tenantId: string;
  routeGroupId?: string;
  operatorId?: string;
  providerId: string;
  routeType: ManagedRouteType;
  priority: ManagedRoutePriority;
  status: RouteLifecycleStatus;
  conditions: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRouteGroupInput {
  code: string;
  name: string;
}

export interface CreateRoutePolicyInput {
  routeGroupId?: string;
  operatorId?: string;
  providerId: string;
  routeType: ManagedRouteType;
  priority: ManagedRoutePriority;
  conditions: Record<string, unknown>;
}

export interface RouteGroupListQuery {
  tenantId: string;
  status?: RouteLifecycleStatus;
  limit: number;
  cursor?: string;
}

export interface RoutePolicyListQuery {
  tenantId: string;
  routeGroupId?: string;
  operatorId?: string;
  providerId?: string;
  routeType?: ManagedRouteType;
  status?: RouteLifecycleStatus;
  limit: number;
  cursor?: string;
}

export interface RouteMutationContext {
  actor: ActorContext;
  requestId: string;
  idempotencyKey: string;
}

export class RouteServiceError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string
  ) {
    super(message);
  }
}

interface RawRouteGroup {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

interface RawRoutePolicy {
  id: string;
  tenantId: string;
  routeGroupId: string | null;
  operatorId: string | null;
  providerId: string;
  routeType: string;
  priority: string;
  status: string;
  conditions: unknown;
  createdAt: Date;
  updatedAt: Date;
}

interface RawScopedEntity {
  id: string;
  tenantId: string;
}

interface RouteGroupCreateArgs {
  data: {
    tenantId: string;
    code: string;
    name: string;
  };
}

interface RoutePolicyCreateArgs {
  data: {
    tenantId: string;
    routeGroupId?: string;
    operatorId?: string;
    providerId: string;
    routeType: string;
    priority: string;
    conditions: Record<string, unknown>;
  };
}

interface RouteGroupFindManyArgs {
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

interface RoutePolicyFindManyArgs {
  where: {
    tenantId: string;
    routeGroupId?: string;
    operatorId?: string;
    providerId?: string;
    routeType?: string;
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

interface FindUniqueArgs {
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

interface IdempotencyFindUniqueArgs {
  where: {
    tenantId_key: {
      tenantId: string;
      key: string;
    };
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

interface RouteTransactionClient {
  routeGroup: {
    create(args: RouteGroupCreateArgs): Promise<RawRouteGroup>;
    findUnique(args: FindUniqueArgs): Promise<RawRouteGroup | null>;
  };
  routePolicy: {
    create(args: RoutePolicyCreateArgs): Promise<RawRoutePolicy>;
  };
  provider: {
    findUnique(args: FindUniqueArgs): Promise<RawScopedEntity | null>;
  };
  operator: {
    findUnique(args: FindUniqueArgs): Promise<RawScopedEntity | null>;
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

export interface RouteDatabaseClient {
  routeGroup: {
    findMany(args: RouteGroupFindManyArgs): Promise<RawRouteGroup[]>;
    findUnique(args: FindUniqueArgs): Promise<RawRouteGroup | null>;
  };
  routePolicy: {
    findMany(args: RoutePolicyFindManyArgs): Promise<RawRoutePolicy[]>;
    findUnique(args: FindUniqueArgs): Promise<RawRoutePolicy | null>;
  };
  $transaction<T>(operation: (tx: RouteTransactionClient) => Promise<T>): Promise<T>;
}

export class RouteRepository {
  constructor(private readonly db: RouteDatabaseClient) {}

  async listGroups(query: RouteGroupListQuery): Promise<RouteGroupRecord[]> {
    const groups = await this.db.routeGroup.findMany({
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

    return groups.map(toRouteGroupRecord);
  }

  async getGroupById(tenantId: string, id: string): Promise<RouteGroupRecord | undefined> {
    const group = await this.db.routeGroup.findUnique({
      where: { id }
    });

    if (!group || group.tenantId !== tenantId) {
      return undefined;
    }

    return toRouteGroupRecord(group);
  }

  async createGroup(context: RouteMutationContext, input: CreateRouteGroupInput): Promise<RouteGroupRecord> {
    const validatedInput = validateCreateRouteGroupInput(input);

    return executeIdempotentMutation(
      this.db,
      context,
      "RouteGroup",
      "route.group.created",
      validatedInput as unknown as Record<string, unknown>,
      async (tx, tenantId) => {
        const group = await tx.routeGroup.create({
          data: {
            tenantId,
            code: validatedInput.code,
            name: validatedInput.name
          }
        });

        return toRouteGroupRecord(group);
      }
    );
  }

  async listPolicies(query: RoutePolicyListQuery): Promise<RoutePolicyRecord[]> {
    const policies = await this.db.routePolicy.findMany({
      where: {
        tenantId: query.tenantId,
        ...(query.routeGroupId ? { routeGroupId: query.routeGroupId } : {}),
        ...(query.operatorId ? { operatorId: query.operatorId } : {}),
        ...(query.providerId ? { providerId: query.providerId } : {}),
        ...(query.routeType ? { routeType: toDbRouteType(query.routeType) } : {}),
        ...(query.status ? { status: toDbStatus(query.status) } : {})
      },
      orderBy: {
        createdAt: "desc"
      },
      take: Math.min(Math.max(query.limit, 1), 100),
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {})
    });

    return policies.map(toRoutePolicyRecord);
  }

  async getPolicyById(tenantId: string, id: string): Promise<RoutePolicyRecord | undefined> {
    const policy = await this.db.routePolicy.findUnique({
      where: { id }
    });

    if (!policy || policy.tenantId !== tenantId) {
      return undefined;
    }

    return toRoutePolicyRecord(policy);
  }

  async createPolicy(context: RouteMutationContext, input: CreateRoutePolicyInput): Promise<RoutePolicyRecord> {
    const validatedInput = validateCreateRoutePolicyInput(input);

    return executeIdempotentMutation(
      this.db,
      context,
      "RoutePolicy",
      "route.policy.created",
      validatedInput as unknown as Record<string, unknown>,
      async (tx, tenantId) => {
        await requireScopedEntity(tx.provider, tenantId, validatedInput.providerId, "provider_not_found", "Provider not found");

        if (validatedInput.routeGroupId) {
          await requireScopedEntity(tx.routeGroup, tenantId, validatedInput.routeGroupId, "route_group_not_found", "Route group not found");
        }

        if (validatedInput.operatorId) {
          await requireScopedEntity(tx.operator, tenantId, validatedInput.operatorId, "operator_not_found", "Operator not found");
        }

        const policy = await tx.routePolicy.create({
          data: {
            tenantId,
            providerId: validatedInput.providerId,
            routeType: toDbRouteType(validatedInput.routeType),
            priority: toDbRoutePriority(validatedInput.priority),
            conditions: validatedInput.conditions,
            ...(validatedInput.routeGroupId ? { routeGroupId: validatedInput.routeGroupId } : {}),
            ...(validatedInput.operatorId ? { operatorId: validatedInput.operatorId } : {})
          }
        });

        return toRoutePolicyRecord(policy);
      }
    );
  }
}

export function normalizeRouteGroupCode(code: string): string {
  const normalized = code.trim().toUpperCase().replace(/[^A-Z0-9_]/g, "_");

  if (normalized.length < 2 || normalized.length > 64) {
    throw new RouteServiceError(400, "invalid_route_group_code", "Route group code must be 2-64 characters after normalization");
  }

  return normalized;
}

export function validateCreateRouteGroupInput(input: unknown): CreateRouteGroupInput {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new RouteServiceError(400, "invalid_route_group_payload", "Route group payload must be an object");
  }

  const candidate = input as Partial<CreateRouteGroupInput>;

  if (typeof candidate.code !== "string") {
    throw new RouteServiceError(400, "invalid_route_group_code", "Route group code is required");
  }

  if (typeof candidate.name !== "string" || candidate.name.trim().length < 2 || candidate.name.trim().length > 160) {
    throw new RouteServiceError(400, "invalid_route_group_name", "Route group name must be 2-160 characters");
  }

  return {
    code: normalizeRouteGroupCode(candidate.code),
    name: candidate.name.trim()
  };
}

export function validateCreateRoutePolicyInput(input: unknown): CreateRoutePolicyInput {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new RouteServiceError(400, "invalid_route_policy_payload", "Route policy payload must be an object");
  }

  const candidate = input as Partial<CreateRoutePolicyInput>;

  if (typeof candidate.providerId !== "string" || candidate.providerId.trim().length === 0) {
    throw new RouteServiceError(400, "invalid_route_policy_provider", "providerId is required");
  }

  if (candidate.routeGroupId !== undefined && (typeof candidate.routeGroupId !== "string" || candidate.routeGroupId.trim().length === 0)) {
    throw new RouteServiceError(400, "invalid_route_policy_group", "routeGroupId must be a non-empty string");
  }

  if (candidate.operatorId !== undefined && (typeof candidate.operatorId !== "string" || candidate.operatorId.trim().length === 0)) {
    throw new RouteServiceError(400, "invalid_route_policy_operator", "operatorId must be a non-empty string");
  }

  if (!isRouteType(candidate.routeType)) {
    throw new RouteServiceError(400, "invalid_route_policy_type", "routeType is invalid");
  }

  if (!isRoutePriority(candidate.priority)) {
    throw new RouteServiceError(400, "invalid_route_policy_priority", "priority is invalid");
  }

  if (!isMetadata(candidate.conditions)) {
    throw new RouteServiceError(400, "invalid_route_policy_conditions", "conditions must be an object");
  }

  return {
    providerId: candidate.providerId.trim(),
    routeType: candidate.routeType,
    priority: candidate.priority,
    conditions: candidate.conditions,
    ...(candidate.routeGroupId ? { routeGroupId: candidate.routeGroupId.trim() } : {}),
    ...(candidate.operatorId ? { operatorId: candidate.operatorId.trim() } : {})
  };
}

async function executeIdempotentMutation<TRecord extends { id: string; tenantId: string }>(
  db: RouteDatabaseClient,
  context: RouteMutationContext,
  entityType: string,
  eventName: DomainEvent["name"],
  requestPayload: Record<string, unknown>,
  operation: (tx: RouteTransactionClient, tenantId: string) => Promise<TRecord>
): Promise<TRecord> {
  const tenantId = context.actor.scope.tenantId;
  const requestHash = stableHash(requestPayload);

  return db.$transaction(async (tx) => {
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
        throw new RouteServiceError(
          409,
          "idempotency_key_reused_with_different_body",
          "Idempotency key was already used with a different request body"
        );
      }

      if (existingIdempotency.status === "COMPLETED" && isRecordWithTenant(existingIdempotency.responseBody)) {
        return existingIdempotency.responseBody as TRecord;
      }

      throw new RouteServiceError(409, "idempotent_request_processing", "Idempotent request is already processing");
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

    const record = await operation(tx, tenantId);
    const event = createDomainEvent({
      name: eventName,
      aggregateType: entityType,
      aggregateId: record.id,
      tenantId,
      payload: record as unknown as Record<string, unknown>
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

async function requireScopedEntity(
  repository: { findUnique(args: FindUniqueArgs): Promise<RawScopedEntity | RawRouteGroup | null> },
  tenantId: string,
  id: string,
  code: string,
  message: string
): Promise<void> {
  const entity = await repository.findUnique({
    where: { id }
  });

  if (!entity || entity.tenantId !== tenantId) {
    throw new RouteServiceError(404, code, message);
  }
}

function toRouteGroupRecord(group: RawRouteGroup): RouteGroupRecord {
  return {
    id: group.id,
    tenantId: group.tenantId,
    code: group.code,
    name: group.name,
    status: fromDbStatus(group.status),
    createdAt: group.createdAt.toISOString(),
    updatedAt: group.updatedAt.toISOString()
  };
}

function toRoutePolicyRecord(policy: RawRoutePolicy): RoutePolicyRecord {
  const record: RoutePolicyRecord = {
    id: policy.id,
    tenantId: policy.tenantId,
    providerId: policy.providerId,
    routeType: fromDbRouteType(policy.routeType),
    priority: fromDbRoutePriority(policy.priority),
    status: fromDbStatus(policy.status),
    conditions: isMetadata(policy.conditions) ? policy.conditions : {},
    createdAt: policy.createdAt.toISOString(),
    updatedAt: policy.updatedAt.toISOString()
  };

  if (policy.routeGroupId) {
    record.routeGroupId = policy.routeGroupId;
  }

  if (policy.operatorId) {
    record.operatorId = policy.operatorId;
  }

  return record;
}

function fromDbStatus(status: string): RouteLifecycleStatus {
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

function toDbStatus(status: RouteLifecycleStatus): string {
  return status.toUpperCase();
}

function fromDbRouteType(routeType: string): ManagedRouteType {
  switch (routeType) {
    case "WALLET":
      return "wallet";
    case "CALLBACK":
      return "callback";
    case "PAYMENT":
      return "payment";
    default:
      return "game_launch";
  }
}

function toDbRouteType(routeType: ManagedRouteType): string {
  return routeType.toUpperCase();
}

function fromDbRoutePriority(priority: string): ManagedRoutePriority {
  switch (priority) {
    case "FALLBACK":
      return "fallback";
    case "BACKUP":
      return "backup";
    case "EMERGENCY":
      return "emergency";
    default:
      return "primary";
  }
}

function toDbRoutePriority(priority: ManagedRoutePriority): string {
  return priority.toUpperCase();
}

function isRouteType(value: unknown): value is ManagedRouteType {
  return value === "game_launch" || value === "wallet" || value === "callback" || value === "payment";
}

function isRoutePriority(value: unknown): value is ManagedRoutePriority {
  return value === "primary" || value === "fallback" || value === "backup" || value === "emergency";
}

function isMetadata(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
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
