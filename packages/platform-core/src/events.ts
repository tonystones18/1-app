export type DomainEventName =
  | "tenant.created"
  | "user.created"
  | "provider.created"
  | "provider.contract.created"
  | "provider.pricing.created"
  | "provider.health.recorded"
  | "vendor.created"
  | "vendor.contract.created"
  | "vendor.pricing.created"
  | "operator.created"
  | "agent.created"
  | "agent.operator.assigned"
  | "game.created"
  | "route.group.created"
  | "route.policy.created"
  | "media.asset.created"
  | "payment.completed"
  | "wallet.transaction.posted"
  | "audit.event.created";

export interface DomainEvent<TPayload extends Record<string, unknown> = Record<string, unknown>> {
  id: string;
  name: DomainEventName;
  aggregateType: string;
  aggregateId: string;
  tenantId: string;
  payload: TPayload;
  occurredAt: string;
  schemaVersion: number;
}

export interface EventPublisher {
  publish<TPayload extends Record<string, unknown>>(event: DomainEvent<TPayload>): Promise<void>;
}

export interface OutboxEventRecord<TPayload extends Record<string, unknown> = Record<string, unknown>>
  extends DomainEvent<TPayload> {
  status: "pending" | "published" | "failed" | "dead_letter";
  attempts: number;
  nextAttemptAt?: string;
  lastError?: string;
}

export function createDomainEvent<TPayload extends Record<string, unknown>>(
  input: Omit<DomainEvent<TPayload>, "id" | "occurredAt" | "schemaVersion"> & { schemaVersion?: number }
): DomainEvent<TPayload> {
  return {
    ...input,
    id: crypto.randomUUID(),
    occurredAt: new Date().toISOString(),
    schemaVersion: input.schemaVersion ?? 1
  };
}
