// Player Service — B2C Player Lifecycle Domain
// Covers: player registration, profile, status management, documents, tags, notes, risk

import type { ActorContext } from "@visionesoft/shared-types";
import { createAuditEvent, type AuditAction } from "@visionesoft/audit";

// ─── Enums / Types ────────────────────────────────────────────────────────────

export type PlayerStatus =
  | "pending_verification"
  | "active"
  | "suspended"
  | "self_excluded"
  | "cooling_off"
  | "dormant"
  | "closed"
  | "locked";

export type PlayerRiskLevel = "low" | "medium" | "high" | "very_high";

export type PlayerDocumentType =
  | "passport"
  | "national_id"
  | "drivers_license"
  | "utility_bill"
  | "bank_statement"
  | "proof_of_funds"
  | "selfie";

export type PlayerDocumentStatus = "pending" | "approved" | "rejected" | "expired";

export type KycStatus = "not_started" | "in_progress" | "passed" | "failed" | "requires_review";

// ─── Domain Records ────────────────────────────────────────────────────────────

export interface PlayerRecord {
  id: string;
  tenantId: string;
  operatorId: string;
  externalId?: string;
  email: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  nationality?: string;
  country: string;
  currency: string;
  language: string;
  status: PlayerStatus;
  riskLevel: PlayerRiskLevel;
  kycStatus: KycStatus;
  emailVerified: boolean;
  mobileVerified: boolean;
  mobileNumber?: string;
  deviceFingerprints: string[];
  tags: string[];
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface PlayerStatusHistory {
  id: string;
  playerId: string;
  tenantId: string;
  operatorId: string;
  previousStatus: PlayerStatus;
  newStatus: PlayerStatus;
  reason: string;
  actorId: string;
  createdAt: string;
}

export interface PlayerDocument {
  id: string;
  playerId: string;
  tenantId: string;
  type: PlayerDocumentType;
  status: PlayerDocumentStatus;
  fileKey: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlayerNote {
  id: string;
  playerId: string;
  tenantId: string;
  content: string;
  authorId: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Inputs / DTOs ────────────────────────────────────────────────────────────

export interface CreatePlayerInput {
  tenantId: string;
  operatorId: string;
  email: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  country: string;
  currency: string;
  language?: string;
  mobileNumber?: string;
  externalId?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdatePlayerProfileInput {
  displayName?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  mobileNumber?: string;
  language?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdatePlayerStatusInput {
  status: PlayerStatus;
  reason: string;
}

export interface AddPlayerTagInput {
  tag: string;
}

export interface AddPlayerNoteInput {
  content: string;
  isPinned?: boolean;
}

export interface ListPlayersInput {
  tenantId: string;
  operatorId?: string;
  status?: PlayerStatus;
  riskLevel?: PlayerRiskLevel;
  kycStatus?: KycStatus;
  search?: string;
  cursor?: string;
  limit?: number;
}

// ─── Validation ───────────────────────────────────────────────────────────────

export function validateCreatePlayerInput(input: CreatePlayerInput): void {
  if (!input.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    throw new PlayerValidationError("INVALID_EMAIL", "Valid email address is required");
  }
  if (!input.displayName || input.displayName.trim().length < 2) {
    throw new PlayerValidationError("INVALID_NAME", "Display name must be at least 2 characters");
  }
  if (!input.country || input.country.length !== 2) {
    throw new PlayerValidationError("INVALID_COUNTRY", "Valid 2-letter country code is required");
  }
  if (!input.currency || input.currency.length !== 3) {
    throw new PlayerValidationError("INVALID_CURRENCY", "Valid 3-letter currency code is required");
  }
}

export class PlayerValidationError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message);
    this.name = "PlayerValidationError";
  }
}

// ─── Database Client Interface ────────────────────────────────────────────────

export interface PlayerDatabaseClient {
  player: {
    findUnique(args: { where: { id: string } | { tenantId_email: { tenantId: string; email: string } } }): Promise<PlayerRecord | null>;
    findMany(args: {
      where: Record<string, unknown>;
      orderBy?: Record<string, unknown>;
      take?: number;
      skip?: number;
      cursor?: { id: string };
    }): Promise<PlayerRecord[]>;
    create(args: { data: Omit<PlayerRecord, "id" | "createdAt" | "updatedAt"> & { id: string; createdAt: string; updatedAt: string } }): Promise<PlayerRecord>;
    update(args: { where: { id: string }; data: Partial<PlayerRecord> }): Promise<PlayerRecord>;
  };
  playerDocument: {
    findMany(args: { where: Record<string, unknown> }): Promise<PlayerDocument[]>;
    create(args: { data: Omit<PlayerDocument, "id" | "createdAt" | "updatedAt"> & { id: string; createdAt: string; updatedAt: string } }): Promise<PlayerDocument>;
    update(args: { where: { id: string }; data: Partial<PlayerDocument> }): Promise<PlayerDocument>;
  };
  playerNote: {
    findMany(args: { where: Record<string, unknown>; orderBy?: Record<string, unknown> }): Promise<PlayerNote[]>;
    create(args: { data: Omit<PlayerNote, "id" | "createdAt" | "updatedAt"> & { id: string; createdAt: string; updatedAt: string } }): Promise<PlayerNote>;
  };
  auditLog: {
    create(args: { data: Record<string, unknown> }): Promise<void>;
  };
  outboxEvent: {
    create(args: { data: Record<string, unknown> }): Promise<void>;
  };
  $transaction<T>(fn: (tx: PlayerDatabaseClient) => Promise<T>): Promise<T>;
}

// ─── Player Repository ────────────────────────────────────────────────────────

export class PlayerRepository {
  constructor(private readonly db: PlayerDatabaseClient) {}

  async list(input: ListPlayersInput): Promise<{ players: PlayerRecord[]; hasMore: boolean }> {
    const limit = Math.min(input.limit ?? 25, 100);
    const where: Record<string, unknown> = { tenantId: input.tenantId };
    if (input.operatorId) where["operatorId"] = input.operatorId;
    if (input.status) where["status"] = input.status;
    if (input.riskLevel) where["riskLevel"] = input.riskLevel;
    if (input.kycStatus) where["kycStatus"] = input.kycStatus;

    const players = await this.db.player.findMany({
      where,
      orderBy: { createdAt: "desc" } as Record<string, unknown>,
      take: limit + 1,
      ...(input.cursor ? { skip: 1, cursor: { id: input.cursor } } : {})
    });

    const hasMore = players.length > limit;
    return { players: players.slice(0, limit), hasMore };
  }

  async getById(id: string): Promise<PlayerRecord | null> {
    return this.db.player.findUnique({ where: { id } });
  }

  async getByEmail(tenantId: string, email: string): Promise<PlayerRecord | null> {
    return this.db.player.findUnique({ where: { tenantId_email: { tenantId, email } } });
  }

  async create(
    input: CreatePlayerInput,
    actor: ActorContext,
    requestId: string,
    idempotencyKey: string
  ): Promise<PlayerRecord> {
    validateCreatePlayerInput(input);

    const existing = await this.getByEmail(input.tenantId, input.email);
    if (existing) {
      throw new PlayerValidationError("DUPLICATE_EMAIL", "A player with this email already exists");
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    return this.db.$transaction(async (tx) => {
      const player = await tx.player.create({
        data: {
          id,
          tenantId: input.tenantId,
          operatorId: input.operatorId,
          externalId: input.externalId,
          email: input.email,
          displayName: input.displayName.trim(),
          firstName: input.firstName,
          lastName: input.lastName,
          dateOfBirth: input.dateOfBirth,
          country: input.country.toUpperCase(),
          currency: input.currency.toUpperCase(),
          language: input.language ?? "en",
          mobileNumber: input.mobileNumber,
          status: "pending_verification",
          riskLevel: "low",
          kycStatus: "not_started",
          emailVerified: false,
          mobileVerified: false,
          deviceFingerprints: [],
          tags: [],
          metadata: input.metadata ?? {},
          createdAt: now,
          updatedAt: now
        }
      });

      const audit = createAuditEvent({
        requestId,
        actor,
        action: "create" as AuditAction,
        entityType: "Player",
        entityId: id
      });
      await tx.auditLog.create({ data: { ...audit, tenantId: input.tenantId } });

      await tx.outboxEvent.create({
        data: {
          id: crypto.randomUUID(),
          tenantId: input.tenantId,
          name: "player.registered",
          aggregateType: "Player",
          aggregateId: id,
          payload: { playerId: id, operatorId: input.operatorId, country: input.country },
          schemaVersion: 1,
          status: "PENDING",
          attempts: 0,
          createdAt: now,
          updatedAt: now
        }
      });

      return player;
    });
  }

  async updateProfile(
    id: string,
    input: UpdatePlayerProfileInput,
    actor: ActorContext,
    requestId: string
  ): Promise<PlayerRecord> {
    const player = await this.getById(id);
    if (!player) throw new PlayerValidationError("NOT_FOUND", "Player not found");

    const updates: Partial<PlayerRecord> = {
      updatedAt: new Date().toISOString()
    };
    if (input.displayName !== undefined) updates.displayName = input.displayName.trim();
    if (input.firstName !== undefined) updates.firstName = input.firstName;
    if (input.lastName !== undefined) updates.lastName = input.lastName;
    if (input.dateOfBirth !== undefined) updates.dateOfBirth = input.dateOfBirth;
    if (input.mobileNumber !== undefined) updates.mobileNumber = input.mobileNumber;
    if (input.language !== undefined) updates.language = input.language;

    return this.db.$transaction(async (tx) => {
      const updated = await tx.player.update({ where: { id }, data: updates });
      const audit = createAuditEvent({
        requestId,
        actor,
        action: "update" as AuditAction,
        entityType: "Player",
        entityId: id,
        diff: updates as Record<string, unknown>
      });
      await tx.auditLog.create({ data: { ...audit, tenantId: player.tenantId } });
      return updated;
    });
  }

  async updateStatus(
    id: string,
    input: UpdatePlayerStatusInput,
    actor: ActorContext,
    requestId: string
  ): Promise<PlayerRecord> {
    const player = await this.getById(id);
    if (!player) throw new PlayerValidationError("NOT_FOUND", "Player not found");

    const now = new Date().toISOString();

    return this.db.$transaction(async (tx) => {
      const updated = await tx.player.update({
        where: { id },
        data: { status: input.status, updatedAt: now }
      });

      const audit = createAuditEvent({
        requestId,
        actor,
        action: "update" as AuditAction,
        entityType: "Player",
        entityId: id,
        reason: input.reason,
        diff: { previousStatus: player.status, newStatus: input.status }
      });
      await tx.auditLog.create({ data: { ...audit, tenantId: player.tenantId } });

      await tx.outboxEvent.create({
        data: {
          id: crypto.randomUUID(),
          tenantId: player.tenantId,
          name: "player.status_changed",
          aggregateType: "Player",
          aggregateId: id,
          payload: { playerId: id, previousStatus: player.status, newStatus: input.status, reason: input.reason },
          schemaVersion: 1,
          status: "PENDING",
          attempts: 0,
          createdAt: now,
          updatedAt: now
        }
      });

      return updated;
    });
  }

  async listDocuments(playerId: string): Promise<PlayerDocument[]> {
    return this.db.playerDocument.findMany({ where: { playerId } });
  }

  async listNotes(playerId: string): Promise<PlayerNote[]> {
    return this.db.playerNote.findMany({
      where: { playerId },
      orderBy: { createdAt: "desc" } as Record<string, unknown>
    });
  }

  async addNote(playerId: string, input: AddPlayerNoteInput, actor: ActorContext): Promise<PlayerNote> {
    const player = await this.getById(playerId);
    if (!player) throw new PlayerValidationError("NOT_FOUND", "Player not found");
    const now = new Date().toISOString();
    return this.db.playerNote.create({
      data: {
        id: crypto.randomUUID(),
        playerId,
        tenantId: player.tenantId,
        content: input.content,
        authorId: actor.actorId,
        isPinned: input.isPinned ?? false,
        createdAt: now,
        updatedAt: now
      }
    });
  }
}
