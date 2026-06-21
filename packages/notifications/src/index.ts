// Notification domain contracts — VisioneSoft Platform

export type NotificationChannel = "email" | "sms" | "push" | "in_app" | "webhook" | "telegram" | "whatsapp";

export type NotificationPriority = "low" | "normal" | "high" | "critical";

export type NotificationStatus =
  | "pending"
  | "queued"
  | "sending"
  | "delivered"
  | "failed"
  | "bounced"
  | "suppressed";

export type NotificationCategory =
  | "transactional"
  | "marketing"
  | "compliance"
  | "responsible_gaming"
  | "operational"
  | "security";

// ─── Template ────────────────────────────────────────────────────────────────

export interface NotificationTemplate {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  category: NotificationCategory;
  channels: NotificationChannel[];
  subjectTemplate?: string;
  bodyTemplate: string;
  variables: string[];
  version: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Delivery ────────────────────────────────────────────────────────────────

export interface NotificationDelivery {
  id: string;
  tenantId: string;
  templateId: string;
  channel: NotificationChannel;
  recipientType: "player" | "operator" | "agent" | "admin" | "external";
  recipientId?: string;
  recipientAddress: string;
  subject?: string;
  body: string;
  status: NotificationStatus;
  attempts: number;
  lastAttemptAt?: string;
  deliveredAt?: string;
  failureReason?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// ─── Suppression ─────────────────────────────────────────────────────────────

export interface NotificationSuppression {
  id: string;
  tenantId: string;
  recipientId?: string;
  recipientAddress?: string;
  channel: NotificationChannel;
  category?: NotificationCategory;
  reason: "opt_out" | "bounced" | "compliance" | "responsible_gaming" | "quiet_hours" | "manual";
  expiresAt?: string;
  createdAt: string;
}

// ─── Preference ──────────────────────────────────────────────────────────────

export interface NotificationPreference {
  id: string;
  tenantId: string;
  recipientId: string;
  channel: NotificationChannel;
  category: NotificationCategory;
  isEnabled: boolean;
  updatedAt: string;
}

// ─── Send Request ──────────────────────────────────────────────────────────────

export interface SendNotificationRequest {
  tenantId: string;
  templateCode: string;
  channel: NotificationChannel;
  recipientType: NotificationDelivery["recipientType"];
  recipientId?: string;
  recipientAddress: string;
  variables: Record<string, string | number | boolean>;
  priority?: NotificationPriority;
  scheduleAt?: string;
  metadata?: Record<string, unknown>;
}

// ─── Render helpers ──────────────────────────────────────────────────────────

export function renderTemplate(
  template: string,
  variables: Record<string, string | number | boolean>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const value = variables[key as string];
    return value !== undefined ? String(value) : `{{${key as string}}}`;
  });
}

export function isChannelSuppressed(
  suppressions: NotificationSuppression[],
  channel: NotificationChannel,
  category?: NotificationCategory
): boolean {
  const now = new Date().toISOString();
  return suppressions.some((s) => {
    if (s.channel !== channel) return false;
    if (s.category && category && s.category !== category) return false;
    if (s.expiresAt && s.expiresAt < now) return false;
    return true;
  });
}
