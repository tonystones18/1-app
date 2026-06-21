import type { ActorContext, TenantType } from "@visionesoft/shared-types";

export type RoleId =
  | "owner_admin"
  | "aggregator_admin"
  | "agent"
  | "operator"
  | "affiliate"
  | "support"
  | "finance_admin"
  | "compliance_admin"
  | "media_manager";

export type PermissionAction = "create" | "read" | "update" | "delete" | "approve" | "export";

export type PermissionResource =
  | "aggregator"
  | "provider"
  | "vendor"
  | "game"
  | "operator"
  | "agent"
  | "route"
  | "finance"
  | "wallet"
  | "payment"
  | "player"
  | "media"
  | "audit"
  | "configuration";

export interface Permission {
  resource: PermissionResource;
  action: PermissionAction;
  tenantTypes: TenantType[];
}

export interface RoleDefinition {
  id: RoleId;
  label: string;
  canViewBuyPrice: boolean;
  permissions: Permission[];
}

const allActions: PermissionAction[] = ["create", "read", "update", "delete", "approve", "export"];

const allResources: PermissionResource[] = [
  "aggregator",
  "provider",
  "vendor",
  "game",
  "operator",
  "agent",
  "route",
  "finance",
  "wallet",
  "payment",
  "player",
  "media",
  "audit",
  "configuration"
];

const platformTenant: TenantType[] = ["platform"];
const operatorTenant: TenantType[] = ["operator", "white_label"];

function permissionsFor(resources: PermissionResource[], actions: PermissionAction[], tenantTypes: TenantType[]): Permission[] {
  return resources.flatMap((resource) =>
    actions.map((action) => ({
      resource,
      action,
      tenantTypes
    }))
  );
}

export const roleRegistry: Record<RoleId, RoleDefinition> = {
  owner_admin: {
    id: "owner_admin",
    label: "Owner Admin",
    canViewBuyPrice: true,
    permissions: permissionsFor(allResources, allActions, platformTenant)
  },
  aggregator_admin: {
    id: "aggregator_admin",
    label: "Aggregator Admin",
    canViewBuyPrice: false,
    permissions: permissionsFor(allResources.filter((resource) => resource !== "finance"), allActions, platformTenant)
  },
  agent: {
    id: "agent",
    label: "Agent",
    canViewBuyPrice: false,
    permissions: permissionsFor(["operator", "player", "wallet", "payment"], ["read", "export"], operatorTenant)
  },
  operator: {
    id: "operator",
    label: "Operator",
    canViewBuyPrice: false,
    permissions: permissionsFor(["player", "wallet", "payment", "media"], ["create", "read", "update", "export"], operatorTenant)
  },
  affiliate: {
    id: "affiliate",
    label: "Affiliate",
    canViewBuyPrice: false,
    permissions: permissionsFor(["player", "payment"], ["read", "export"], operatorTenant)
  },
  support: {
    id: "support",
    label: "Support",
    canViewBuyPrice: false,
    permissions: permissionsFor(["player", "wallet", "payment", "audit"], ["read"], operatorTenant)
  },
  finance_admin: {
    id: "finance_admin",
    label: "Finance Admin",
    canViewBuyPrice: false,
    permissions: permissionsFor(["finance", "wallet", "payment", "audit"], ["create", "read", "update", "approve", "export"], platformTenant)
  },
  compliance_admin: {
    id: "compliance_admin",
    label: "Compliance Admin",
    canViewBuyPrice: false,
    permissions: permissionsFor(["player", "payment", "audit"], ["read", "update", "approve", "export"], platformTenant)
  },
  media_manager: {
    id: "media_manager",
    label: "Media Manager",
    canViewBuyPrice: false,
    permissions: permissionsFor(["media"], ["create", "read", "update", "delete", "approve"], platformTenant)
  }
};

export function can(actor: ActorContext, resource: PermissionResource, action: PermissionAction): boolean {
  const role = roleRegistry[actor.roleId as RoleId];

  if (!role) {
    return false;
  }

  return role.permissions.some((permission) =>
    permission.resource === resource &&
    permission.action === action &&
    permission.tenantTypes.includes(actor.scope.tenantType)
  );
}
