import { createDomainEvent, type DomainEvent } from "@visionesoft/platform-core";
import type { ActorContext } from "@visionesoft/shared-types";
import { createHash } from "node:crypto";

export type OperatorStatus = "draft" | "active" | "suspended" | "archived";
export type AgentStatus = OperatorStatus;

export interface OperatorRecord {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  status: OperatorStatus;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface AgentRecord {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  status: AgentStatus;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface AgentOperatorAssignmentRecord {
  id: string;
  tenantId: string;
  agentId: string;
  operatorId: string;
  status: OperatorStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOperatorInput {
  code: string;
  name: string;
  metadata?: Record<string, unknown>;
}

export interface CreateAgentInput {
  code: string;
  name: string;
  metadata?: Record<string, unknown>;
}

export interface AssignOperatorToAgentInput {
  operatorId: string;
}

export interface ProfileListQuery<TStatus extends string> {
  tenantId: string;
  status?: TStatus;
  limit: number;
  cursor?: string;
}

export interface OperatorMutationContext {
  actor: ActorContext;
  requestId: string;
  idempotencyKey: string;
}

export class OperatorServiceError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string
  ) {
    super(message);
  }
}

interface RawProfile {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  status: string;
  metadata: unknown;
  createdAt: Date;
  updatedAt: Date;
}

interface RawAssignment {
  id: string;
  tenantId: string;
  agentId: string;
  operatorId: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ProfileCreateArgs {
  data: {
    tenantId: string;
    code: string;
    name: string;
    metadata?: Record<string, unknown>;
  };
}

interface ProfileFindManyArgs {
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

interface FindUniqueArgs {
  where: {
    id: string;
  };
}

interface AssignmentCreateArgs {
  data: {
    tenantId: string;
    agentId: string;
    operatorId: string;
  };
}

interface AssignmentFindManyArgs {
  where: {
    tenantId: string;
    agentId?: string;
    operatorId?: string;
    status?: string;
  };
  orderBy: {
    createdAt: "asc" | "desc";
  };
  take: number;
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

interface OperatorTransactionClient {
  operator: {
    create(args: ProfileCreateArgs): Promise<RawProfile>;
    findUnique(args: FindUniqueArgs): Promise<RawProfile | null>;
  };
  agent: {
    create(args: ProfileCreateArgs): Promise<RawProfile>;
    findUnique(args: FindUniqueArgs): Promise<RawProfile | null>;
  };
  agentOperator: {
    create(args: AssignmentCreateArgs): Promise<RawAssignment>;
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

export interface OperatorDatabaseClient {
  operator: {
    findMany(args: ProfileFindManyArgs): Promise<RawProfile[]>;
    findUnique(args: FindUniqueArgs): Promise<RawProfile | null>;
  };
  agent: {
    findMany(args: ProfileFindManyArgs): Promise<RawProfile[]>;
    findUnique(args: FindUniqueArgs): Promise<RawProfile | null>;
  };
  agentOperator: {
    findMany(args: AssignmentFindManyArgs): Promise<RawAssignment[]>;
  };
  $transaction<T>(operation: (tx: OperatorTransactionClient) => Promise<T>): Promise<T>;
}

export class OperatorRepository {
  constructor(private readonly db: OperatorDatabaseClient) {}

  async list(query: ProfileListQuery<OperatorStatus>): Promise<OperatorRecord[]> {
    const operators = await this.db.operator.findMany({
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

    return operators.map(toOperatorRecord);
  }

  async getById(tenantId: string, id: string): Promise<OperatorRecord | undefined> {
    const operator = await this.db.operator.findUnique({
      where: { id }
    });

    if (!operator || operator.tenantId !== tenantId) {
      return undefined;
    }

    return toOperatorRecord(operator);
  }

  async create(context: OperatorMutationContext, input: CreateOperatorInput): Promise<OperatorRecord> {
    const validatedInput = validateCreateOperatorInput(input);

    return executeIdempotentMutation(
      this.db,
      context,
      "Operator",
      "operator.created",
      validatedInput as unknown as Record<string, unknown>,
      async (tx, tenantId) => {
        const operator = await tx.operator.create({
          data: {
            tenantId,
            code: validatedInput.code,
            name: validatedInput.name,
            ...(validatedInput.metadata ? { metadata: validatedInput.metadata } : {})
          }
        });

        return toOperatorRecord(operator);
      }
    );
  }
}

export class AgentRepository {
  constructor(private readonly db: OperatorDatabaseClient) {}

  async list(query: ProfileListQuery<AgentStatus>): Promise<AgentRecord[]> {
    const agents = await this.db.agent.findMany({
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

    return agents.map(toAgentRecord);
  }

  async getById(tenantId: string, id: string): Promise<AgentRecord | undefined> {
    const agent = await this.db.agent.findUnique({
      where: { id }
    });

    if (!agent || agent.tenantId !== tenantId) {
      return undefined;
    }

    return toAgentRecord(agent);
  }

  async create(context: OperatorMutationContext, input: CreateAgentInput): Promise<AgentRecord> {
    const validatedInput = validateCreateAgentInput(input);

    return executeIdempotentMutation(
      this.db,
      context,
      "Agent",
      "agent.created",
      validatedInput as unknown as Record<string, unknown>,
      async (tx, tenantId) => {
        const agent = await tx.agent.create({
          data: {
            tenantId,
            code: validatedInput.code,
            name: validatedInput.name,
            ...(validatedInput.metadata ? { metadata: validatedInput.metadata } : {})
          }
        });

        return toAgentRecord(agent);
      }
    );
  }

  async listAssignments(tenantId: string, agentId: string, limit = 50): Promise<AgentOperatorAssignmentRecord[]> {
    await this.requireAgent(tenantId, agentId);
    const assignments = await this.db.agentOperator.findMany({
      where: {
        tenantId,
        agentId,
        status: "ACTIVE"
      },
      orderBy: {
        createdAt: "desc"
      },
      take: Math.min(Math.max(limit, 1), 100)
    });

    return assignments.map(toAssignmentRecord);
  }

  async assignOperator(
    context: OperatorMutationContext,
    agentId: string,
    input: AssignOperatorToAgentInput
  ): Promise<AgentOperatorAssignmentRecord> {
    const validatedInput = validateAssignOperatorToAgentInput(input);

    return executeIdempotentMutation(
      this.db,
      context,
      "AgentOperator",
      "agent.operator.assigned",
      {
        agentId,
        operatorId: validatedInput.operatorId
      },
      async (tx, tenantId) => {
        const agent = await tx.agent.findUnique({ where: { id: agentId } });
        const operator = await tx.operator.findUnique({ where: { id: validatedInput.operatorId } });

        if (!agent || agent.tenantId !== tenantId) {
          throw new OperatorServiceError(404, "agent_not_found", "Agent not found");
        }

        if (!operator || operator.tenantId !== tenantId) {
          throw new OperatorServiceError(404, "operator_not_found", "Operator not found");
        }

        const assignment = await tx.agentOperator.create({
          data: {
            tenantId,
            agentId,
            operatorId: validatedInput.operatorId
          }
        });

        return toAssignmentRecord(assignment);
      }
    );
  }

  private async requireAgent(tenantId: string, agentId: string): Promise<AgentRecord> {
    const agent = await this.getById(tenantId, agentId);

    if (!agent) {
      throw new OperatorServiceError(404, "agent_not_found", "Agent not found");
    }

    return agent;
  }
}

export function normalizeOperatorCode(code: string): string {
  return normalizeCode(code, "operator");
}

export function normalizeAgentCode(code: string): string {
  return normalizeCode(code, "agent");
}

export function validateCreateOperatorInput(input: unknown): CreateOperatorInput {
  const profile = validateProfileInput(input, "operator");

  return {
    code: normalizeOperatorCode(profile.code),
    name: profile.name,
    ...(profile.metadata ? { metadata: profile.metadata } : {})
  };
}

export function validateCreateAgentInput(input: unknown): CreateAgentInput {
  const profile = validateProfileInput(input, "agent");

  return {
    code: normalizeAgentCode(profile.code),
    name: profile.name,
    ...(profile.metadata ? { metadata: profile.metadata } : {})
  };
}

export function validateAssignOperatorToAgentInput(input: unknown): AssignOperatorToAgentInput {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new OperatorServiceError(400, "invalid_assignment_payload", "Assignment payload must be an object");
  }

  const candidate = input as Partial<AssignOperatorToAgentInput>;

  if (typeof candidate.operatorId !== "string" || candidate.operatorId.trim().length === 0) {
    throw new OperatorServiceError(400, "invalid_assignment_operator", "operatorId is required");
  }

  return {
    operatorId: candidate.operatorId.trim()
  };
}

async function executeIdempotentMutation<TRecord extends { id: string; tenantId: string }>(
  db: OperatorDatabaseClient,
  context: OperatorMutationContext,
  entityType: string,
  eventName: DomainEvent["name"],
  requestPayload: Record<string, unknown>,
  operation: (tx: OperatorTransactionClient, tenantId: string) => Promise<TRecord>
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
        throw new OperatorServiceError(
          409,
          "idempotency_key_reused_with_different_body",
          "Idempotency key was already used with a different request body"
        );
      }

      if (existingIdempotency.status === "COMPLETED" && isRecordWithTenant(existingIdempotency.responseBody)) {
        return existingIdempotency.responseBody as TRecord;
      }

      throw new OperatorServiceError(409, "idempotent_request_processing", "Idempotent request is already processing");
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

function validateProfileInput(input: unknown, entityName: "operator" | "agent"): CreateOperatorInput {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new OperatorServiceError(400, `invalid_${entityName}_payload`, `${capitalize(entityName)} payload must be an object`);
  }

  const candidate = input as Partial<CreateOperatorInput>;

  if (typeof candidate.code !== "string") {
    throw new OperatorServiceError(400, `invalid_${entityName}_code`, `${capitalize(entityName)} code is required`);
  }

  if (typeof candidate.name !== "string") {
    throw new OperatorServiceError(400, `invalid_${entityName}_name`, `${capitalize(entityName)} name is required`);
  }

  if (candidate.metadata !== undefined && !isMetadata(candidate.metadata)) {
    throw new OperatorServiceError(400, `invalid_${entityName}_metadata`, `${capitalize(entityName)} metadata must be an object`);
  }

  const name = candidate.name.trim();

  if (name.length < 2 || name.length > 160) {
    throw new OperatorServiceError(400, `invalid_${entityName}_name`, `${capitalize(entityName)} name must be 2-160 characters`);
  }

  return {
    code: candidate.code,
    name,
    ...(candidate.metadata ? { metadata: candidate.metadata } : {})
  };
}

function normalizeCode(code: string, entityName: "operator" | "agent"): string {
  const normalized = code.trim().toUpperCase().replace(/[^A-Z0-9_]/g, "_");

  if (normalized.length < 2 || normalized.length > 64) {
    throw new OperatorServiceError(400, `invalid_${entityName}_code`, `${capitalize(entityName)} code must be 2-64 characters after normalization`);
  }

  return normalized;
}

function toOperatorRecord(operator: RawProfile): OperatorRecord {
  return toProfileRecord(operator) as OperatorRecord;
}

function toAgentRecord(agent: RawProfile): AgentRecord {
  return toProfileRecord(agent) as AgentRecord;
}

function toProfileRecord(profile: RawProfile): OperatorRecord {
  const record: OperatorRecord = {
    id: profile.id,
    tenantId: profile.tenantId,
    code: profile.code,
    name: profile.name,
    status: fromDbStatus(profile.status),
    createdAt: profile.createdAt.toISOString(),
    updatedAt: profile.updatedAt.toISOString()
  };

  if (isMetadata(profile.metadata)) {
    record.metadata = profile.metadata;
  }

  return record;
}

function toAssignmentRecord(assignment: RawAssignment): AgentOperatorAssignmentRecord {
  return {
    id: assignment.id,
    tenantId: assignment.tenantId,
    agentId: assignment.agentId,
    operatorId: assignment.operatorId,
    status: fromDbStatus(assignment.status),
    createdAt: assignment.createdAt.toISOString(),
    updatedAt: assignment.updatedAt.toISOString()
  };
}

function fromDbStatus(status: string): OperatorStatus {
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

function toDbStatus(status: OperatorStatus): string {
  return status.toUpperCase();
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

function capitalize(value: string): string {
  return `${value.slice(0, 1).toUpperCase()}${value.slice(1)}`;
}
