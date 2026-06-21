export interface IdempotencyRecord {
  key: string;
  tenantId: string;
  requestHash: string;
  responseHash?: string;
  status: "processing" | "completed" | "failed";
  lockedUntil: string;
  createdAt: string;
  updatedAt: string;
}

export interface IdempotencyStore {
  reserve(key: string, tenantId: string, requestHash: string, ttlSeconds: number): Promise<IdempotencyRecord>;
  complete(key: string, tenantId: string, responseHash: string): Promise<IdempotencyRecord>;
  fail(key: string, tenantId: string): Promise<IdempotencyRecord>;
}
