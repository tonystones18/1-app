import type { ActorContext, TenantScope } from "@visionesoft/shared-types";
import type { RoleId } from "@visionesoft/permissions";

export interface SessionPrincipal {
  userId: string;
  email: string;
  roleId: RoleId;
  scope: TenantScope;
  sessionId: string;
}

export function toActorContext(principal: SessionPrincipal, request: { ipAddress?: string; userAgent?: string }): ActorContext {
  const actor: ActorContext = {
    actorId: principal.userId,
    roleId: principal.roleId,
    scope: principal.scope
  };

  if (request.ipAddress) {
    actor.ipAddress = request.ipAddress;
  }

  if (request.userAgent) {
    actor.userAgent = request.userAgent;
  }

  return actor;
}
