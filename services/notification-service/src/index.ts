// Notification Service — Template management, Channel delivery, Preferences, Suppression

import {
  renderTemplate,
  isChannelSuppressed,
  type NotificationTemplate,
  type NotificationDelivery,
  type NotificationPreference,
  type NotificationSuppression,
  type SendNotificationRequest,
  type NotificationChannel,
  type NotificationCategory
} from "@visionesoft/notifications";

// ─── DB Client ────────────────────────────────────────────────────────────────

export interface NotificationDatabaseClient {
  notificationTemplate: {
    findUnique(args: { where: { id: string } | { tenantId_code: { tenantId: string; code: string } } }): Promise<NotificationTemplate | null>;
    findMany(args: { where: Record<string, unknown> }): Promise<NotificationTemplate[]>;
    create(args: { data: NotificationTemplate }): Promise<NotificationTemplate>;
    update(args: { where: { id: string }; data: Partial<NotificationTemplate> }): Promise<NotificationTemplate>;
  };
  notificationDelivery: {
    create(args: { data: NotificationDelivery }): Promise<NotificationDelivery>;
    update(args: { where: { id: string }; data: Partial<NotificationDelivery> }): Promise<NotificationDelivery>;
    findMany(args: { where: Record<string, unknown>; orderBy?: Record<string, unknown>; take?: number }): Promise<NotificationDelivery[]>;
  };
  notificationPreference: {
    findMany(args: { where: Record<string, unknown> }): Promise<NotificationPreference[]>;
    upsert(args: {
      where: { recipientId_channel_category: { recipientId: string; channel: NotificationChannel; category: NotificationCategory } };
      create: NotificationPreference;
      update: Partial<NotificationPreference>;
    }): Promise<NotificationPreference>;
  };
  notificationSuppression: {
    findMany(args: { where: Record<string, unknown> }): Promise<NotificationSuppression[]>;
    create(args: { data: NotificationSuppression }): Promise<NotificationSuppression>;
  };
}

// ─── Channel Provider Interface ───────────────────────────────────────────────

export interface ChannelProvider {
  channel: NotificationChannel;
  send(to: string, subject: string | undefined, body: string): Promise<{ success: boolean; providerRef?: string }>;
}

// ─── Notification Service ─────────────────────────────────────────────────────

export class NotificationService {
  constructor(
    private readonly db: NotificationDatabaseClient,
    private readonly channelProviders: Map<NotificationChannel, ChannelProvider>
  ) {}

  async send(request: SendNotificationRequest): Promise<NotificationDelivery> {
    // Resolve template
    const template = await this.db.notificationTemplate.findUnique({
      where: { tenantId_code: { tenantId: request.tenantId, code: request.templateCode } }
    });
    if (!template?.isActive) {
      throw new Error(`Notification template not found or inactive: ${request.templateCode}`);
    }

    if (!template.channels.includes(request.channel)) {
      throw new Error(`Template ${request.templateCode} does not support channel: ${request.channel}`);
    }

    // Check suppression
    if (request.recipientId) {
      const suppressions = await this.db.notificationSuppression.findMany({
        where: { tenantId: request.tenantId, recipientId: request.recipientId }
      });
      if (isChannelSuppressed(suppressions, request.channel, template.category)) {
        return this.createDeliveryRecord(request, template, "suppressed", undefined);
      }
    }

    // Check preferences
    if (request.recipientId) {
      const prefs = await this.db.notificationPreference.findMany({
        where: { tenantId: request.tenantId, recipientId: request.recipientId }
      });
      const pref = prefs.find((p) => p.channel === request.channel && p.category === template.category);
      if (pref && !pref.isEnabled) {
        return this.createDeliveryRecord(request, template, "suppressed", undefined);
      }
    }

    // Render content
    const subject = template.subjectTemplate
      ? renderTemplate(template.subjectTemplate, request.variables)
      : undefined;
    const body = renderTemplate(template.bodyTemplate, request.variables);

    // Send via channel provider
    const provider = this.channelProviders.get(request.channel);
    const now = new Date().toISOString();
    const deliveryId = crypto.randomUUID();

    if (!provider) {
      return this.createDeliveryRecord(request, template, "failed", "No provider configured for channel", deliveryId);
    }

    let result: { success: boolean; providerRef?: string };
    try {
      result = await provider.send(request.recipientAddress, subject, body);
    } catch (err) {
      return this.createDeliveryRecord(request, template, "failed", String(err), deliveryId);
    }

    return this.db.notificationDelivery.create({
      data: {
        id: deliveryId,
        tenantId: request.tenantId,
        templateId: template.id,
        channel: request.channel,
        recipientType: request.recipientType,
        recipientId: request.recipientId,
        recipientAddress: request.recipientAddress,
        subject,
        body,
        status: result.success ? "delivered" : "failed",
        attempts: 1,
        lastAttemptAt: now,
        deliveredAt: result.success ? now : undefined,
        failureReason: result.success ? undefined : "Provider send failed",
        metadata: { ...request.metadata, providerRef: result.providerRef },
        createdAt: now,
        updatedAt: now
      }
    });
  }

  async createTemplate(
    tenantId: string,
    template: Omit<NotificationTemplate, "id" | "createdAt" | "updatedAt">
  ): Promise<NotificationTemplate> {
    const now = new Date().toISOString();
    return this.db.notificationTemplate.create({
      data: { ...template, id: crypto.randomUUID(), tenantId, createdAt: now, updatedAt: now }
    });
  }

  async setPreference(
    tenantId: string,
    recipientId: string,
    channel: NotificationChannel,
    category: NotificationCategory,
    isEnabled: boolean
  ): Promise<NotificationPreference> {
    const now = new Date().toISOString();
    const pref: NotificationPreference = {
      id: crypto.randomUUID(),
      tenantId,
      recipientId,
      channel,
      category,
      isEnabled,
      updatedAt: now
    };
    return this.db.notificationPreference.upsert({
      where: { recipientId_channel_category: { recipientId, channel, category } },
      create: pref,
      update: { isEnabled, updatedAt: now }
    });
  }

  async addSuppression(
    tenantId: string,
    recipientId: string | undefined,
    recipientAddress: string | undefined,
    channel: NotificationChannel,
    reason: NotificationSuppression["reason"]
  ): Promise<NotificationSuppression> {
    const now = new Date().toISOString();
    return this.db.notificationSuppression.create({
      data: {
        id: crypto.randomUUID(),
        tenantId,
        recipientId,
        recipientAddress,
        channel,
        reason,
        createdAt: now
      }
    });
  }

  private async createDeliveryRecord(
    request: SendNotificationRequest,
    template: NotificationTemplate,
    status: NotificationDelivery["status"],
    failureReason?: string,
    id?: string
  ): Promise<NotificationDelivery> {
    const now = new Date().toISOString();
    return this.db.notificationDelivery.create({
      data: {
        id: id ?? crypto.randomUUID(),
        tenantId: request.tenantId,
        templateId: template.id,
        channel: request.channel,
        recipientType: request.recipientType,
        recipientId: request.recipientId,
        recipientAddress: request.recipientAddress,
        body: "",
        status,
        attempts: 0,
        failureReason,
        createdAt: now,
        updatedAt: now
      }
    });
  }
}
