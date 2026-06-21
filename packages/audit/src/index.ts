import type { ActorContext } from "@visionesoft/shared-types";

export type AuditAction =
  | "create"
  | "read"
  | "update"
  | "delete"
  | "approve"
  | "reject"
  | "login"
  | "logout"
  | "export";

export interface AuditEvent {
  id: string;
  requestId: string;
  actor: ActorContext;
  action: AuditAction;
  entityType: string;
  entityId: string;
  reason?: string;
  diff?: Record<string, unknown>;
  createdAt: string;
}

export function createAuditEvent(input: Omit<AuditEvent, "id" | "createdAt">): AuditEvent {
  return {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString()
  };
}
