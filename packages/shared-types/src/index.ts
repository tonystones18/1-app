export type BuildStatus = "planned" | "in_development" | "under_testing" | "completed";

export type TenantType =
  | "platform"
  | "aggregator"
  | "operator"
  | "white_label";

export interface TenantScope {
  tenantId: string;
  tenantType: TenantType;
  operatorId?: string;
  whiteLabelId?: string;
}

export interface ActorContext {
  actorId: string;
  roleId: string;
  scope: TenantScope;
  ipAddress?: string;
  userAgent?: string;
}

export interface ApiEnvelope<TData> {
  requestId: string;
  data: TData;
  warnings?: string[];
}

export interface PageRequest {
  cursor?: string;
  limit: number;
}

export interface PageResponse<TItem> {
  items: TItem[];
  nextCursor?: string;
}

export interface DomainEntity {
  id: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface HealthSnapshot {
  service: string;
  status: "ok" | "degraded" | "down";
  version: string;
  checkedAt: string;
}
