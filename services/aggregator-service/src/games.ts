import { createDomainEvent } from "@visionesoft/platform-core";
import type { ActorContext } from "@visionesoft/shared-types";
import { createHash } from "node:crypto";

export type GameStatus = "draft" | "active" | "suspended" | "archived";

export interface GameRecord {
  id: string;
  tenantId: string;
  providerId: string;
  externalId: string;
  name: string;
  category: string;
  status: GameStatus;
  rtpBps?: number;
  volatility?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGameInput {
  providerId: string;
  externalId: string;
  name: string;
  category: string;
  rtpBps?: number;
  volatility?: string;
  metadata?: Record<string, unknown>;
}

export interface GameListQuery {
  tenantId: string;
  providerId?: string;
  category?: string;
  status?: GameStatus;
  limit: number;
  cursor?: string;
}

export interface GameMutationContext {
  actor: ActorContext;
  requestId: string;
  idempotencyKey: string;
}

export class GameServiceError extends Error {
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
}

interface RawGame {
  id: string;
  tenantId: string;
  providerId: string;
  externalId: string;
  name: string;
  category: string;
  status: string;
  rtpBps: number | null;
  volatility: string | null;
  metadata: unknown;
  createdAt: Date;
  updatedAt: Date;
}

interface GameCreateArgs {
  data: {
    tenantId: string;
    providerId: string;
    externalId: string;
    name: string;
    category: string;
    rtpBps?: number;
    volatility?: string;
    metadata?: Record<string, unknown>;
  };
}

interface GameFindManyArgs {
  where: {
    tenantId: string;
    providerId?: string;
    category?: string;
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

interface GameTransactionClient {
  provider: {
    findUnique(args: FindUniqueArgs): Promise<RawProvider | null>;
  };
  game: {
    create(args: GameCreateArgs): Promise<RawGame>;
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

export interface GameDatabaseClient {
  game: {
    findMany(args: GameFindManyArgs): Promise<RawGame[]>;
    findUnique(args: FindUniqueArgs): Promise<RawGame | null>;
  };
  $transaction<T>(operation: (tx: GameTransactionClient) => Promise<T>): Promise<T>;
}

export class GameRepository {
  constructor(private readonly db: GameDatabaseClient) {}

  async list(query: GameListQuery): Promise<GameRecord[]> {
    const games = await this.db.game.findMany({
      where: {
        tenantId: query.tenantId,
        ...(query.providerId ? { providerId: query.providerId } : {}),
        ...(query.category ? { category: normalizeGameCategory(query.category) } : {}),
        ...(query.status ? { status: toDbStatus(query.status) } : {})
      },
      orderBy: {
        createdAt: "desc"
      },
      take: Math.min(Math.max(query.limit, 1), 100),
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {})
    });

    return games.map(toGameRecord);
  }

  async getById(tenantId: string, id: string): Promise<GameRecord | undefined> {
    const game = await this.db.game.findUnique({
      where: { id }
    });

    if (!game || game.tenantId !== tenantId) {
      return undefined;
    }

    return toGameRecord(game);
  }

  async create(context: GameMutationContext, input: CreateGameInput): Promise<GameRecord> {
    const tenantId = context.actor.scope.tenantId;
    const validatedInput = validateCreateGameInput(input);
    const requestHash = stableHash(validatedInput);

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
          throw new GameServiceError(
            409,
            "idempotency_key_reused_with_different_body",
            "Idempotency key was already used with a different request body"
          );
        }

        if (existingIdempotency.status === "COMPLETED" && isGameRecord(existingIdempotency.responseBody)) {
          return existingIdempotency.responseBody;
        }

        throw new GameServiceError(409, "idempotent_request_processing", "Idempotent request is already processing");
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

      const provider = await tx.provider.findUnique({
        where: {
          id: validatedInput.providerId
        }
      });

      if (!provider || provider.tenantId !== tenantId) {
        throw new GameServiceError(404, "provider_not_found", "Provider not found");
      }

      const game = await tx.game.create({
        data: {
          tenantId,
          providerId: validatedInput.providerId,
          externalId: validatedInput.externalId,
          name: validatedInput.name,
          category: validatedInput.category,
          ...(validatedInput.rtpBps !== undefined ? { rtpBps: validatedInput.rtpBps } : {}),
          ...(validatedInput.volatility ? { volatility: validatedInput.volatility } : {}),
          ...(validatedInput.metadata ? { metadata: validatedInput.metadata } : {})
        }
      });
      const record = toGameRecord(game);
      const event = createDomainEvent({
        name: "game.created",
        aggregateType: "Game",
        aggregateId: record.id,
        tenantId,
        payload: record as unknown as Record<string, unknown>
      });

      await tx.auditLog.create({
        data: {
          tenantId,
          actorId: context.actor.actorId,
          entityType: "Game",
          entityId: record.id,
          action: "create",
          reason: "game_created",
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

export function validateCreateGameInput(input: unknown): CreateGameInput {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new GameServiceError(400, "invalid_game_payload", "Game payload must be an object");
  }

  const candidate = input as Partial<CreateGameInput>;

  if (typeof candidate.providerId !== "string" || candidate.providerId.trim().length === 0) {
    throw new GameServiceError(400, "invalid_game_provider", "providerId is required");
  }

  if (typeof candidate.externalId !== "string" || candidate.externalId.trim().length < 1 || candidate.externalId.trim().length > 128) {
    throw new GameServiceError(400, "invalid_game_external_id", "externalId must be 1-128 characters");
  }

  if (typeof candidate.name !== "string" || candidate.name.trim().length < 2 || candidate.name.trim().length > 180) {
    throw new GameServiceError(400, "invalid_game_name", "Game name must be 2-180 characters");
  }

  if (typeof candidate.category !== "string") {
    throw new GameServiceError(400, "invalid_game_category", "Game category is required");
  }

  if (candidate.rtpBps !== undefined && (!Number.isInteger(candidate.rtpBps) || candidate.rtpBps < 0 || candidate.rtpBps > 10000)) {
    throw new GameServiceError(400, "invalid_game_rtp", "rtpBps must be an integer from 0 to 10000");
  }

  if (candidate.volatility !== undefined && (typeof candidate.volatility !== "string" || candidate.volatility.trim().length > 64)) {
    throw new GameServiceError(400, "invalid_game_volatility", "volatility must be up to 64 characters");
  }

  if (candidate.metadata !== undefined && !isMetadata(candidate.metadata)) {
    throw new GameServiceError(400, "invalid_game_metadata", "Game metadata must be an object");
  }

  return {
    providerId: candidate.providerId.trim(),
    externalId: candidate.externalId.trim(),
    name: candidate.name.trim(),
    category: normalizeGameCategory(candidate.category),
    ...(candidate.rtpBps !== undefined ? { rtpBps: candidate.rtpBps } : {}),
    ...(candidate.volatility ? { volatility: candidate.volatility.trim().toLowerCase() } : {}),
    ...(candidate.metadata ? { metadata: candidate.metadata } : {})
  };
}

export function normalizeGameCategory(category: string): string {
  const normalized = category.trim().toLowerCase().replace(/[^a-z0-9_]/g, "_");

  if (normalized.length < 2 || normalized.length > 64) {
    throw new GameServiceError(400, "invalid_game_category", "Game category must be 2-64 characters after normalization");
  }

  return normalized;
}

function toGameRecord(game: RawGame): GameRecord {
  const record: GameRecord = {
    id: game.id,
    tenantId: game.tenantId,
    providerId: game.providerId,
    externalId: game.externalId,
    name: game.name,
    category: game.category,
    status: fromDbStatus(game.status),
    createdAt: game.createdAt.toISOString(),
    updatedAt: game.updatedAt.toISOString()
  };

  if (game.rtpBps !== null) {
    record.rtpBps = game.rtpBps;
  }

  if (game.volatility !== null) {
    record.volatility = game.volatility;
  }

  if (isMetadata(game.metadata)) {
    record.metadata = game.metadata;
  }

  return record;
}

function fromDbStatus(status: string): GameStatus {
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

function toDbStatus(status: GameStatus): string {
  return status.toUpperCase();
}

function isMetadata(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isGameRecord(value: unknown): value is GameRecord {
  return Boolean(value) &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    typeof (value as GameRecord).id === "string" &&
    typeof (value as GameRecord).tenantId === "string" &&
    typeof (value as GameRecord).providerId === "string" &&
    typeof (value as GameRecord).externalId === "string";
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
