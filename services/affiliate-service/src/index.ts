// Affiliate Service — Affiliate Management, Campaigns, Tracking, Commissions

import type { ActorContext } from "@visionesoft/shared-types";
import { createAuditEvent } from "@visionesoft/audit";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AffiliateStatus = "pending" | "active" | "suspended" | "terminated";
export type CommissionModel = "revenue_share" | "cpa" | "hybrid" | "flat_fee";
export type CampaignStatus = "draft" | "active" | "paused" | "ended";

export interface Affiliate {
  id: string;
  tenantId: string;
  operatorId: string;
  code: string;
  name: string;
  email: string;
  website?: string;
  country?: string;
  status: AffiliateStatus;
  commissionModel: CommissionModel;
  revenueSharePercent?: number;
  cpaAmount?: string;
  currency: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AffiliateCampaign {
  id: string;
  affiliateId: string;
  tenantId: string;
  operatorId: string;
  name: string;
  status: CampaignStatus;
  landingUrl: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  registrations: number;
  ftdCount: number;
  totalDeposits: string;
  totalCommission: string;
  currency: string;
  startsAt?: string;
  endsAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AffiliateTrackingLink {
  id: string;
  campaignId: string;
  affiliateId: string;
  tenantId: string;
  token: string;
  url: string;
  clicks: number;
  registrations: number;
  isActive: boolean;
  createdAt: string;
}

export interface AffiliateCommissionRecord {
  id: string;
  affiliateId: string;
  campaignId?: string;
  tenantId: string;
  playerId: string;
  type: "registration" | "ftd" | "ggr_share" | "cpa" | "manual";
  amount: string;
  currency: string;
  status: "pending" | "approved" | "paid" | "reversed";
  period?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// ─── Inputs ────────────────────────────────────────────────────────────────

export interface CreateAffiliateInput {
  tenantId: string;
  operatorId: string;
  code: string;
  name: string;
  email: string;
  website?: string;
  country?: string;
  commissionModel: CommissionModel;
  revenueSharePercent?: number;
  cpaAmount?: string;
  currency: string;
}

export interface CreateCampaignInput {
  affiliateId: string;
  tenantId: string;
  operatorId: string;
  name: string;
  landingUrl: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  startsAt?: string;
  endsAt?: string;
}

export interface TrackConversionInput {
  token: string;
  playerId: string;
  type: AffiliateCommissionRecord["type"];
  amount?: string;
  currency: string;
  metadata?: Record<string, unknown>;
}

// ─── DB Client ────────────────────────────────────────────────────────────────

export interface AffiliateDatabaseClient {
  affiliate: {
    findUnique(args: { where: { id: string } | { tenantId_code: { tenantId: string; code: string } } }): Promise<Affiliate | null>;
    findMany(args: { where: Record<string, unknown>; orderBy?: Record<string, unknown> }): Promise<Affiliate[]>;
    create(args: { data: Affiliate }): Promise<Affiliate>;
    update(args: { where: { id: string }; data: Partial<Affiliate> }): Promise<Affiliate>;
  };
  affiliateCampaign: {
    findUnique(args: { where: { id: string } }): Promise<AffiliateCampaign | null>;
    findMany(args: { where: Record<string, unknown> }): Promise<AffiliateCampaign[]>;
    create(args: { data: AffiliateCampaign }): Promise<AffiliateCampaign>;
    update(args: { where: { id: string }; data: Partial<AffiliateCampaign> }): Promise<AffiliateCampaign>;
  };
  affiliateTrackingLink: {
    findUnique(args: { where: { token: string } }): Promise<AffiliateTrackingLink | null>;
    create(args: { data: AffiliateTrackingLink }): Promise<AffiliateTrackingLink>;
    update(args: { where: { id: string }; data: Partial<AffiliateTrackingLink> }): Promise<AffiliateTrackingLink>;
  };
  affiliateCommission: {
    create(args: { data: AffiliateCommissionRecord }): Promise<AffiliateCommissionRecord>;
    findMany(args: { where: Record<string, unknown> }): Promise<AffiliateCommissionRecord[]>;
  };
  auditLog: { create(args: { data: Record<string, unknown> }): Promise<void> };
  outboxEvent: { create(args: { data: Record<string, unknown> }): Promise<void> };
  $transaction<T>(fn: (tx: AffiliateDatabaseClient) => Promise<T>): Promise<T>;
}

// ─── Affiliate Service ────────────────────────────────────────────────────────

export class AffiliateService {
  constructor(private readonly db: AffiliateDatabaseClient) {}

  async createAffiliate(input: CreateAffiliateInput, actor: ActorContext, requestId: string): Promise<Affiliate> {
    const existing = await this.db.affiliate.findUnique({
      where: { tenantId_code: { tenantId: input.tenantId, code: input.code } }
    });
    if (existing) throw new Error("Affiliate code already exists");

    const now = new Date().toISOString();
    return this.db.affiliate.create({
      data: {
        id: crypto.randomUUID(),
        tenantId: input.tenantId,
        operatorId: input.operatorId,
        code: input.code.toLowerCase(),
        name: input.name,
        email: input.email,
        website: input.website,
        country: input.country,
        status: "pending",
        commissionModel: input.commissionModel,
        revenueSharePercent: input.revenueSharePercent,
        cpaAmount: input.cpaAmount,
        currency: input.currency.toUpperCase(),
        tags: [],
        createdAt: now,
        updatedAt: now
      }
    });
  }

  async createCampaign(input: CreateCampaignInput, actor: ActorContext, requestId: string): Promise<AffiliateCampaign> {
    const now = new Date().toISOString();
    const campaign = await this.db.affiliateCampaign.create({
      data: {
        id: crypto.randomUUID(),
        affiliateId: input.affiliateId,
        tenantId: input.tenantId,
        operatorId: input.operatorId,
        name: input.name,
        status: "draft",
        landingUrl: input.landingUrl,
        utmSource: input.utmSource,
        utmMedium: input.utmMedium,
        utmCampaign: input.utmCampaign,
        registrations: 0,
        ftdCount: 0,
        totalDeposits: "0.00",
        totalCommission: "0.00",
        currency: "USD",
        startsAt: input.startsAt,
        endsAt: input.endsAt,
        createdAt: now,
        updatedAt: now
      }
    });

    // Generate default tracking link
    const token = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
    const trackingUrl = `${input.landingUrl}?ref=${token}&utm_source=${input.utmSource ?? ""}&utm_medium=${input.utmMedium ?? ""}`;
    await this.db.affiliateTrackingLink.create({
      data: {
        id: crypto.randomUUID(),
        campaignId: campaign.id,
        affiliateId: input.affiliateId,
        tenantId: input.tenantId,
        token,
        url: trackingUrl,
        clicks: 0,
        registrations: 0,
        isActive: true,
        createdAt: now
      }
    });

    return campaign;
  }

  async trackConversion(input: TrackConversionInput, requestId: string): Promise<AffiliateCommissionRecord | null> {
    const link = await this.db.affiliateTrackingLink.findUnique({ where: { token: input.token } });
    if (!link?.isActive) return null;

    const campaign = await this.db.affiliateCampaign.findUnique({ where: { id: link.campaignId } });
    if (!campaign) return null;

    const affiliate = await this.db.affiliate.findUnique({ where: { id: campaign.affiliateId } });
    if (!affiliate || affiliate.status !== "active") return null;

    // Calculate commission
    let commissionAmount = "0.00";
    if (input.type === "cpa" && affiliate.cpaAmount) {
      commissionAmount = affiliate.cpaAmount;
    } else if (input.type === "ggr_share" && input.amount && affiliate.revenueSharePercent) {
      commissionAmount = ((parseFloat(input.amount) * affiliate.revenueSharePercent) / 100).toFixed(2);
    }

    const now = new Date().toISOString();
    const record = await this.db.affiliateCommission.create({
      data: {
        id: crypto.randomUUID(),
        affiliateId: affiliate.id,
        campaignId: campaign.id,
        tenantId: affiliate.tenantId,
        playerId: input.playerId,
        type: input.type,
        amount: commissionAmount,
        currency: input.currency,
        status: "pending",
        metadata: input.metadata,
        createdAt: now
      }
    });

    return record;
  }

  async listAffiliates(tenantId: string, operatorId?: string): Promise<Affiliate[]> {
    const where: Record<string, unknown> = { tenantId };
    if (operatorId) where["operatorId"] = operatorId;
    return this.db.affiliate.findMany({ where, orderBy: { createdAt: "desc" } as Record<string, unknown> });
  }
}
