import type { DomainEntity } from "@visionesoft/shared-types";
export * from "./routes.js";

export type RouteType = "game_launch" | "wallet" | "callback" | "payment";
export type RoutePriority = "primary" | "fallback" | "backup" | "emergency";

export interface RoutePolicy extends DomainEntity {
  name: string;
  routeType: RouteType;
  priority: RoutePriority;
  providerId: string;
  operatorId?: string;
  enabled: boolean;
}

export interface RouteDecisionInput {
  routeType: RouteType;
  operatorId: string;
  gameId?: string;
  country?: string;
  currency?: string;
}

export interface RouteDecision {
  policyId: string;
  providerId: string;
  priority: RoutePriority;
  reason: string;
}

export function selectRoute(input: RouteDecisionInput, policies: RoutePolicy[]): RouteDecision | undefined {
  const candidates = policies.filter((policy) =>
    policy.enabled &&
    policy.routeType === input.routeType &&
    (!policy.operatorId || policy.operatorId === input.operatorId)
  );

  const selected = candidates.find((policy) => policy.priority === "primary") ?? candidates[0];

  if (!selected) {
    return undefined;
  }

  return {
    policyId: selected.id,
    providerId: selected.providerId,
    priority: selected.priority,
    reason: "Matched enabled route policy"
  };
}
