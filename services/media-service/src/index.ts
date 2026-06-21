// Media Service — Asset management, R2 storage, Cloudflare Images, Approvals, Transformations

import type { ActorContext } from "@visionesoft/shared-types";
import { createAuditEvent } from "@visionesoft/audit";

// ─── Types ────────────────────────────────────────────────────────────────────

export type MediaAssetType = "provider_logo" | "game_image" | "banner" | "brand_asset" | "document" | "ai_generated";
export type MediaAssetStatus = "draft" | "pending_approval" | "approved" | "rejected" | "archived";
export type TransformationType = "resize" | "crop" | "format_convert" | "compress" | "background_removal";

export interface MediaAssetRecord {
  id: string;
  tenantId: string;
  ownerType: "platform" | "provider" | "vendor" | "operator" | "game" | "campaign";
  ownerId?: string;
  type: MediaAssetType;
  status: MediaAssetStatus;
  title: string;
  description?: string;
  r2Key: string;
  r2Bucket: string;
  r2Url?: string;
  cloudflareImageId?: string;
  cloudflareDeliveryUrl?: string;
  mimeType: string;
  sizeBytes: number;
  width?: number;
  height?: number;
  tags: string[];
  aiGenerated: boolean;
  aiPrompt?: string;
  aiModel?: string;
  version: number;
  parentAssetId?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface MediaTransformationJob {
  id: string;
  assetId: string;
  tenantId: string;
  type: TransformationType;
  inputKey: string;
  outputKey?: string;
  status: "pending" | "processing" | "completed" | "failed";
  options: Record<string, unknown>;
  error?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MediaApprovalRequest {
  id: string;
  assetId: string;
  tenantId: string;
  requestedBy: string;
  status: "pending" | "approved" | "rejected";
  comments?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Inputs ────────────────────────────────────────────────────────────────

export interface RegisterAssetInput {
  tenantId: string;
  ownerType: MediaAssetRecord["ownerType"];
  ownerId?: string;
  type: MediaAssetType;
  title: string;
  description?: string;
  r2Key: string;
  r2Bucket: string;
  mimeType: string;
  sizeBytes: number;
  width?: number;
  height?: number;
  tags?: string[];
  aiGenerated?: boolean;
  aiPrompt?: string;
  aiModel?: string;
  metadata?: Record<string, unknown>;
}

export interface RequestApprovalInput {
  assetId: string;
  tenantId: string;
  requestedBy: string;
  comments?: string;
}

export interface ApproveAssetInput {
  assetId: string;
  approvedBy: string;
}

export interface RejectAssetInput {
  assetId: string;
  rejectedBy: string;
  reason: string;
}

export interface CreateTransformationInput {
  assetId: string;
  tenantId: string;
  type: TransformationType;
  options: Record<string, unknown>;
}

// ─── DB Client ────────────────────────────────────────────────────────────────

export interface MediaDatabaseClient {
  mediaAsset: {
    findUnique(args: { where: { id: string } }): Promise<MediaAssetRecord | null>;
    findMany(args: { where: Record<string, unknown>; orderBy?: Record<string, unknown>; take?: number }): Promise<MediaAssetRecord[]>;
    create(args: { data: MediaAssetRecord }): Promise<MediaAssetRecord>;
    update(args: { where: { id: string }; data: Partial<MediaAssetRecord> }): Promise<MediaAssetRecord>;
  };
  mediaTransformationJob: {
    create(args: { data: MediaTransformationJob }): Promise<MediaTransformationJob>;
    findMany(args: { where: Record<string, unknown> }): Promise<MediaTransformationJob[]>;
    update(args: { where: { id: string }; data: Partial<MediaTransformationJob> }): Promise<MediaTransformationJob>;
  };
  mediaApprovalRequest: {
    findUnique(args: { where: { assetId: string } }): Promise<MediaApprovalRequest | null>;
    create(args: { data: MediaApprovalRequest }): Promise<MediaApprovalRequest>;
    update(args: { where: { id: string }; data: Partial<MediaApprovalRequest> }): Promise<MediaApprovalRequest>;
  };
  auditLog: { create(args: { data: Record<string, unknown> }): Promise<void> };
  outboxEvent: { create(args: { data: Record<string, unknown> }): Promise<void> };
  $transaction<T>(fn: (tx: MediaDatabaseClient) => Promise<T>): Promise<T>;
}

// ─── Media Service ────────────────────────────────────────────────────────────

export class MediaService {
  constructor(private readonly db: MediaDatabaseClient) {}

  async registerAsset(input: RegisterAssetInput, actor: ActorContext, requestId: string): Promise<MediaAssetRecord> {
    const now = new Date().toISOString();
    const assetId = crypto.randomUUID();

    return this.db.$transaction(async (tx) => {
      const asset = await tx.mediaAsset.create({
        data: {
          id: assetId,
          tenantId: input.tenantId,
          ownerType: input.ownerType,
          ownerId: input.ownerId,
          type: input.type,
          status: "draft",
          title: input.title,
          description: input.description,
          r2Key: input.r2Key,
          r2Bucket: input.r2Bucket,
          mimeType: input.mimeType,
          sizeBytes: input.sizeBytes,
          width: input.width,
          height: input.height,
          tags: input.tags ?? [],
          aiGenerated: input.aiGenerated ?? false,
          aiPrompt: input.aiPrompt,
          aiModel: input.aiModel,
          version: 1,
          metadata: input.metadata,
          createdAt: now,
          updatedAt: now
        }
      });

      const audit = createAuditEvent({ requestId, actor, action: "create", entityType: "MediaAsset", entityId: assetId });
      await tx.auditLog.create({ data: { ...audit, tenantId: input.tenantId } });
      return asset;
    });
  }

  async requestApproval(input: RequestApprovalInput, actor: ActorContext, requestId: string): Promise<MediaApprovalRequest> {
    const asset = await this.db.mediaAsset.findUnique({ where: { id: input.assetId } });
    if (!asset) throw new Error("Asset not found");
    if (asset.status !== "draft") throw new Error("Asset must be in draft status to request approval");

    const now = new Date().toISOString();

    return this.db.$transaction(async (tx) => {
      await tx.mediaAsset.update({ where: { id: input.assetId }, data: { status: "pending_approval", updatedAt: now } });

      const approval = await tx.mediaApprovalRequest.create({
        data: {
          id: crypto.randomUUID(), assetId: input.assetId, tenantId: input.tenantId,
          requestedBy: input.requestedBy, status: "pending", comments: input.comments,
          createdAt: now, updatedAt: now
        }
      });

      const audit = createAuditEvent({ requestId, actor, action: "update", entityType: "MediaAsset", entityId: input.assetId, diff: { status: "pending_approval" } });
      await tx.auditLog.create({ data: { ...audit, tenantId: input.tenantId } });

      return approval;
    });
  }

  async approveAsset(input: ApproveAssetInput, actor: ActorContext, requestId: string): Promise<MediaAssetRecord> {
    const asset = await this.db.mediaAsset.findUnique({ where: { id: input.assetId } });
    if (!asset) throw new Error("Asset not found");

    const now = new Date().toISOString();
    return this.db.$transaction(async (tx) => {
      const updated = await tx.mediaAsset.update({
        where: { id: input.assetId },
        data: { status: "approved", approvedBy: input.approvedBy, approvedAt: now, updatedAt: now }
      });

      const approval = await tx.mediaApprovalRequest.findUnique({ where: { assetId: input.assetId } });
      if (approval) {
        await tx.mediaApprovalRequest.update({ where: { id: approval.id }, data: { status: "approved", reviewedBy: input.approvedBy, reviewedAt: now, updatedAt: now } });
      }

      await tx.outboxEvent.create({
        data: {
          id: crypto.randomUUID(), tenantId: asset.tenantId, name: "media.asset_approved",
          aggregateType: "MediaAsset", aggregateId: input.assetId,
          payload: { assetId: input.assetId, type: asset.type, approvedBy: input.approvedBy },
          schemaVersion: 1, status: "PENDING", attempts: 0, createdAt: now, updatedAt: now
        }
      });

      const audit = createAuditEvent({ requestId, actor, action: "approve", entityType: "MediaAsset", entityId: input.assetId });
      await tx.auditLog.create({ data: { ...audit, tenantId: asset.tenantId } });
      return updated;
    });
  }

  async rejectAsset(input: RejectAssetInput, actor: ActorContext, requestId: string): Promise<MediaAssetRecord> {
    const asset = await this.db.mediaAsset.findUnique({ where: { id: input.assetId } });
    if (!asset) throw new Error("Asset not found");
    const now = new Date().toISOString();
    return this.db.mediaAsset.update({
      where: { id: input.assetId },
      data: { status: "rejected", rejectedBy: input.rejectedBy, rejectionReason: input.reason, updatedAt: now }
    });
  }

  async queueTransformation(input: CreateTransformationInput, actor: ActorContext): Promise<MediaTransformationJob> {
    const asset = await this.db.mediaAsset.findUnique({ where: { id: input.assetId } });
    if (!asset) throw new Error("Asset not found");
    const now = new Date().toISOString();
    return this.db.mediaTransformationJob.create({
      data: {
        id: crypto.randomUUID(), assetId: input.assetId, tenantId: input.tenantId,
        type: input.type, inputKey: asset.r2Key, status: "pending",
        options: input.options, createdAt: now, updatedAt: now
      }
    });
  }

  async listAssets(tenantId: string, ownerType?: string, ownerId?: string, limit = 50): Promise<MediaAssetRecord[]> {
    const where: Record<string, unknown> = { tenantId };
    if (ownerType) where["ownerType"] = ownerType;
    if (ownerId) where["ownerId"] = ownerId;
    return this.db.mediaAsset.findMany({ where, orderBy: { createdAt: "desc" } as Record<string, unknown>, take: limit });
  }
}
