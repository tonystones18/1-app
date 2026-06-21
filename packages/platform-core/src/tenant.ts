import type { ActorContext, TenantScope, TenantType } from "@visionesoft/shared-types";

export interface TenantScopedRecord {
  tenantId: string;
  operatorId?: string;
  whiteLabelId?: string;
}

export function assertTenantAccess(actor: ActorContext, record: TenantScopedRecord): void {
  if (actor.scope.tenantType === "platform") {
    return;
  }

  if (actor.scope.tenantId !== record.tenantId) {
    throw new Error("Tenant scope mismatch");
  }

  if (actor.scope.operatorId && record.operatorId && actor.scope.operatorId !== record.operatorId) {
    throw new Error("Operator scope mismatch");
  }

  if (actor.scope.whiteLabelId && record.whiteLabelId && actor.scope.whiteLabelId !== record.whiteLabelId) {
    throw new Error("White-label scope mismatch");
  }
}

export function createTenantScope(input: {
  tenantId: string;
  tenantType: TenantType;
  operatorId?: string;
  whiteLabelId?: string;
}): TenantScope {
  const scope: TenantScope = {
    tenantId: input.tenantId,
    tenantType: input.tenantType
  };

  if (input.operatorId) {
    scope.operatorId = input.operatorId;
  }

  if (input.whiteLabelId) {
    scope.whiteLabelId = input.whiteLabelId;
  }

  return scope;
}
