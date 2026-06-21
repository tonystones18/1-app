import assert from "node:assert/strict";
import test from "node:test";
import {
  ProviderRepository,
  ProviderServiceError,
  normalizeProviderCode,
  validateCreateProviderPricingInput,
  validateCreateProviderInput
} from "../../services/aggregator-service/dist/index.js";

function actor() {
  return {
    actorId: "owner-1",
    roleId: "owner_admin",
    scope: {
      tenantId: "tenant-1",
      tenantType: "platform"
    }
  };
}

function createProviderDatabase() {
  const state = {
    providers: [],
    contracts: [],
    pricing: [],
    health: [],
    auditLogs: [],
    outboxEvents: [],
    idempotencyKeys: new Map()
  };

  const transactionClient = {
    provider: {
      async create(args) {
        const now = new Date("2026-06-20T00:00:00.000Z");
        const provider = {
          id: `provider-${state.providers.length + 1}`,
          tenantId: args.data.tenantId,
          code: args.data.code,
          name: args.data.name,
          status: "DRAFT",
          metadata: args.data.metadata ?? null,
          createdAt: now,
          updatedAt: now
        };
        state.providers.push(provider);
        return provider;
      },
      async findUnique(args) {
        return state.providers.find((provider) => provider.id === args.where.id) ?? null;
      }
    },
    providerContract: {
      async create(args) {
        const now = new Date("2026-06-20T00:00:00.000Z");
        const contract = {
          id: `contract-${state.contracts.length + 1}`,
          tenantId: args.data.tenantId,
          providerId: args.data.providerId,
          name: args.data.name,
          status: "DRAFT",
          startsAt: args.data.startsAt,
          endsAt: args.data.endsAt ?? null,
          commercial: args.data.commercial,
          createdAt: now,
          updatedAt: now
        };
        state.contracts.push(contract);
        return contract;
      }
    },
    providerPricing: {
      async create(args) {
        const now = new Date("2026-06-20T00:00:00.000Z");
        const pricing = {
          id: `pricing-${state.pricing.length + 1}`,
          tenantId: args.data.tenantId,
          providerId: args.data.providerId,
          currency: args.data.currency,
          buyBps: args.data.buyBps,
          minFee: args.data.minFee ?? null,
          maxFee: args.data.maxFee ?? null,
          effectiveAt: args.data.effectiveAt,
          createdAt: now,
          updatedAt: now
        };
        state.pricing.push(pricing);
        return pricing;
      }
    },
    providerHealth: {
      async create(args) {
        const health = {
          id: `health-${state.health.length + 1}`,
          tenantId: args.data.tenantId,
          providerId: args.data.providerId,
          status: args.data.status,
          latencyMs: args.data.latencyMs ?? null,
          errorRate: args.data.errorRate ?? null,
          checkedAt: args.data.checkedAt,
          details: args.data.details ?? null
        };
        state.health.push(health);
        return health;
      }
    },
    auditLog: {
      async create(args) {
        state.auditLogs.push(args.data);
        return args.data;
      }
    },
    outboxEvent: {
      async create(args) {
        state.outboxEvents.push(args.data);
        return args.data;
      }
    },
    idempotencyKey: {
      async findUnique(args) {
        return state.idempotencyKeys.get(`${args.where.tenantId_key.tenantId}:${args.where.tenantId_key.key}`) ?? null;
      },
      async create(args) {
        state.idempotencyKeys.set(`${args.data.tenantId}:${args.data.key}`, {
          requestHash: args.data.requestHash,
          status: args.data.status,
          responseBody: null
        });
        return args.data;
      },
      async update(args) {
        const key = `${args.where.tenantId_key.tenantId}:${args.where.tenantId_key.key}`;
        const existing = state.idempotencyKeys.get(key);
        const updated = {
          ...existing,
          ...args.data
        };
        state.idempotencyKeys.set(key, updated);
        return updated;
      }
    }
  };

  const db = {
    provider: {
      async findMany(args) {
        return state.providers
          .filter((provider) => provider.tenantId === args.where.tenantId)
          .filter((provider) => !args.where.status || provider.status === args.where.status);
      },
      async findUnique(args) {
        return state.providers.find((provider) => provider.id === args.where.id) ?? null;
      }
    },
    providerContract: {
      async findMany(args) {
        return state.contracts
          .filter((contract) => contract.tenantId === args.where.tenantId)
          .filter((contract) => contract.providerId === args.where.providerId);
      }
    },
    providerPricing: {
      async findMany(args) {
        return state.pricing
          .filter((pricing) => pricing.tenantId === args.where.tenantId)
          .filter((pricing) => pricing.providerId === args.where.providerId)
          .filter((pricing) => !args.where.currency || pricing.currency === args.where.currency);
      }
    },
    providerHealth: {
      async findMany(args) {
        return state.health
          .filter((health) => health.tenantId === args.where.tenantId)
          .filter((health) => health.providerId === args.where.providerId);
      }
    },
    async $transaction(operation) {
      return operation(transactionClient);
    }
  };

  return { db, state };
}

test("provider code normalization is deterministic", () => {
  assert.equal(normalizeProviderCode(" pragmatic play "), "PRAGMATIC_PLAY");
});

test("provider payload validation rejects malformed payloads", () => {
  assert.throws(
    () => validateCreateProviderInput({ code: "P" }),
    (error) => error instanceof ProviderServiceError && error.statusCode === 400
  );
});

test("provider pricing validation normalizes currency and decimal fees", () => {
  assert.deepEqual(validateCreateProviderPricingInput({
    currency: "usd",
    buyBps: 1250,
    minFee: 0,
    maxFee: "10.250000",
    effectiveAt: "2026-06-20T00:00:00.000Z"
  }), {
    currency: "USD",
    buyBps: 1250,
    minFee: "0",
    maxFee: "10.250000",
    effectiveAt: "2026-06-20T00:00:00.000Z"
  });
});

test("provider creation writes provider, audit log, outbox event, and idempotency result", async () => {
  const { db, state } = createProviderDatabase();
  const repository = new ProviderRepository(db);

  const provider = await repository.create({
    actor: actor(),
    requestId: "request-1",
    idempotencyKey: "provider-create-0001"
  }, {
    code: "pragmatic",
    name: "Pragmatic Play",
    metadata: {
      region: "global"
    }
  });

  assert.equal(provider.code, "PRAGMATIC");
  assert.equal(state.providers.length, 1);
  assert.equal(state.auditLogs.length, 1);
  assert.equal(state.outboxEvents.length, 1);
  assert.equal(state.outboxEvents[0].name, "provider.created");
  assert.equal(state.idempotencyKeys.get("tenant-1:provider-create-0001").status, "COMPLETED");
});

test("provider creation returns stored response for idempotent replay", async () => {
  const { db, state } = createProviderDatabase();
  const repository = new ProviderRepository(db);
  const context = {
    actor: actor(),
    requestId: "request-1",
    idempotencyKey: "provider-create-0002"
  };
  const input = {
    code: "evolution",
    name: "Evolution"
  };

  const first = await repository.create(context, input);
  const second = await repository.create(context, input);

  assert.deepEqual(second, first);
  assert.equal(state.providers.length, 1);
});

test("provider contract creation writes audit and outbox records", async () => {
  const { db, state } = createProviderDatabase();
  const repository = new ProviderRepository(db);
  const provider = await repository.create({
    actor: actor(),
    requestId: "request-provider",
    idempotencyKey: "provider-create-0003"
  }, {
    code: "hacksaw",
    name: "Hacksaw Gaming"
  });

  const contract = await repository.createContract({
    actor: actor(),
    requestId: "request-contract",
    idempotencyKey: "contract-create-0001"
  }, provider.id, {
    name: "Global casino supply agreement",
    startsAt: "2026-06-20T00:00:00.000Z",
    commercial: {
      revenueShareBps: 1200
    }
  });

  assert.equal(contract.providerId, provider.id);
  assert.equal(state.contracts.length, 1);
  assert.equal(state.outboxEvents.at(-1).name, "provider.contract.created");
  assert.equal(state.auditLogs.at(-1).entityType, "ProviderContract");
});

test("provider pricing creation writes audit and outbox records", async () => {
  const { db, state } = createProviderDatabase();
  const repository = new ProviderRepository(db);
  const provider = await repository.create({
    actor: actor(),
    requestId: "request-provider",
    idempotencyKey: "provider-create-0004"
  }, {
    code: "pgsoft",
    name: "PG Soft"
  });

  const pricing = await repository.createPricing({
    actor: actor(),
    requestId: "request-pricing",
    idempotencyKey: "pricing-create-0001"
  }, provider.id, {
    currency: "eur",
    buyBps: 1000,
    effectiveAt: "2026-06-20T00:00:00.000Z"
  });

  assert.equal(pricing.currency, "EUR");
  assert.equal(state.pricing.length, 1);
  assert.equal(state.outboxEvents.at(-1).name, "provider.pricing.created");
  assert.equal(state.auditLogs.at(-1).entityType, "ProviderPricing");
});

test("provider health recording writes audit and outbox records", async () => {
  const { db, state } = createProviderDatabase();
  const repository = new ProviderRepository(db);
  const provider = await repository.create({
    actor: actor(),
    requestId: "request-provider",
    idempotencyKey: "provider-create-0005"
  }, {
    code: "evolution",
    name: "Evolution"
  });

  const health = await repository.recordHealth({
    actor: actor(),
    requestId: "request-health",
    idempotencyKey: "health-create-0001"
  }, provider.id, {
    status: "online",
    latencyMs: 42,
    errorRate: "0.0100",
    checkedAt: "2026-06-20T00:00:00.000Z"
  });

  assert.equal(health.status, "online");
  assert.equal(state.health.length, 1);
  assert.equal(state.outboxEvents.at(-1).name, "provider.health.recorded");
  assert.equal(state.auditLogs.at(-1).entityType, "ProviderHealth");
});
