import assert from "node:assert/strict";
import test from "node:test";
import {
  VendorRepository,
  VendorServiceError,
  normalizeVendorCode,
  validateCreateVendorInput,
  validateCreateVendorPricingInput
} from "../../services/vendor-service/dist/index.js";

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

function createVendorDatabase() {
  const state = {
    vendors: [],
    contracts: [],
    pricing: [],
    auditLogs: [],
    outboxEvents: [],
    idempotencyKeys: new Map()
  };

  const transactionClient = {
    vendor: {
      async create(args) {
        const now = new Date("2026-06-20T00:00:00.000Z");
        const vendor = {
          id: `vendor-${state.vendors.length + 1}`,
          tenantId: args.data.tenantId,
          code: args.data.code,
          name: args.data.name,
          status: "DRAFT",
          metadata: args.data.metadata ?? null,
          createdAt: now,
          updatedAt: now
        };
        state.vendors.push(vendor);
        return vendor;
      },
      async findUnique(args) {
        return state.vendors.find((vendor) => vendor.id === args.where.id) ?? null;
      }
    },
    vendorContract: {
      async create(args) {
        const now = new Date("2026-06-20T00:00:00.000Z");
        const contract = {
          id: `contract-${state.contracts.length + 1}`,
          tenantId: args.data.tenantId,
          vendorId: args.data.vendorId,
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
    vendorPricing: {
      async create(args) {
        const now = new Date("2026-06-20T00:00:00.000Z");
        const pricing = {
          id: `pricing-${state.pricing.length + 1}`,
          tenantId: args.data.tenantId,
          vendorId: args.data.vendorId,
          currency: args.data.currency,
          sellBps: args.data.sellBps,
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
    vendor: {
      async findMany(args) {
        return state.vendors
          .filter((vendor) => vendor.tenantId === args.where.tenantId)
          .filter((vendor) => !args.where.status || vendor.status === args.where.status);
      },
      async findUnique(args) {
        return state.vendors.find((vendor) => vendor.id === args.where.id) ?? null;
      }
    },
    vendorContract: {
      async findMany(args) {
        return state.contracts
          .filter((contract) => contract.tenantId === args.where.tenantId)
          .filter((contract) => contract.vendorId === args.where.vendorId);
      }
    },
    vendorPricing: {
      async findMany(args) {
        return state.pricing
          .filter((pricing) => pricing.tenantId === args.where.tenantId)
          .filter((pricing) => pricing.vendorId === args.where.vendorId)
          .filter((pricing) => !args.where.currency || pricing.currency === args.where.currency);
      }
    },
    async $transaction(operation) {
      return operation(transactionClient);
    }
  };

  return { db, state };
}

test("vendor code normalization is deterministic", () => {
  assert.equal(normalizeVendorCode(" asian routes "), "ASIAN_ROUTES");
});

test("vendor payload validation rejects malformed payloads", () => {
  assert.throws(
    () => validateCreateVendorInput({ code: "V" }),
    (error) => error instanceof VendorServiceError && error.statusCode === 400
  );
});

test("vendor pricing validation normalizes currency and decimal fees", () => {
  assert.deepEqual(validateCreateVendorPricingInput({
    currency: "eur",
    sellBps: 1750,
    minFee: 0,
    maxFee: "12.500000",
    effectiveAt: "2026-06-20T00:00:00.000Z"
  }), {
    currency: "EUR",
    sellBps: 1750,
    minFee: "0",
    maxFee: "12.500000",
    effectiveAt: "2026-06-20T00:00:00.000Z"
  });
});

test("vendor creation writes vendor, audit log, outbox event, and idempotency result", async () => {
  const { db, state } = createVendorDatabase();
  const repository = new VendorRepository(db);

  const vendor = await repository.create({
    actor: actor(),
    requestId: "request-1",
    idempotencyKey: "vendor-create-0001"
  }, {
    code: "asia route",
    name: "Asia Route Vendor",
    metadata: {
      region: "apac"
    }
  });

  assert.equal(vendor.code, "ASIA_ROUTE");
  assert.equal(state.vendors.length, 1);
  assert.equal(state.auditLogs.length, 1);
  assert.equal(state.outboxEvents.length, 1);
  assert.equal(state.outboxEvents[0].name, "vendor.created");
  assert.equal(state.idempotencyKeys.get("tenant-1:vendor-create-0001").status, "COMPLETED");
});

test("vendor creation returns stored response for idempotent replay", async () => {
  const { db, state } = createVendorDatabase();
  const repository = new VendorRepository(db);
  const context = {
    actor: actor(),
    requestId: "request-1",
    idempotencyKey: "vendor-create-0002"
  };
  const input = {
    code: "premium",
    name: "Premium Vendor"
  };

  const first = await repository.create(context, input);
  const second = await repository.create(context, input);

  assert.deepEqual(second, first);
  assert.equal(state.vendors.length, 1);
});

test("vendor contract creation writes audit and outbox records", async () => {
  const { db, state } = createVendorDatabase();
  const repository = new VendorRepository(db);
  const vendor = await repository.create({
    actor: actor(),
    requestId: "request-vendor",
    idempotencyKey: "vendor-create-0003"
  }, {
    code: "reseller",
    name: "Reseller Vendor"
  });

  const contract = await repository.createContract({
    actor: actor(),
    requestId: "request-contract",
    idempotencyKey: "vendor-contract-create-0001"
  }, vendor.id, {
    name: "Regional distribution agreement",
    startsAt: "2026-06-20T00:00:00.000Z",
    commercial: {
      revenueShareBps: 1800
    }
  });

  assert.equal(contract.vendorId, vendor.id);
  assert.equal(state.contracts.length, 1);
  assert.equal(state.outboxEvents.at(-1).name, "vendor.contract.created");
  assert.equal(state.auditLogs.at(-1).entityType, "VendorContract");
});

test("vendor pricing creation writes audit and outbox records", async () => {
  const { db, state } = createVendorDatabase();
  const repository = new VendorRepository(db);
  const vendor = await repository.create({
    actor: actor(),
    requestId: "request-vendor",
    idempotencyKey: "vendor-create-0004"
  }, {
    code: "premium",
    name: "Premium Vendor"
  });

  const pricing = await repository.createPricing({
    actor: actor(),
    requestId: "request-pricing",
    idempotencyKey: "vendor-pricing-create-0001"
  }, vendor.id, {
    currency: "usd",
    sellBps: 2500,
    effectiveAt: "2026-06-20T00:00:00.000Z"
  });

  assert.equal(pricing.currency, "USD");
  assert.equal(state.pricing.length, 1);
  assert.equal(state.outboxEvents.at(-1).name, "vendor.pricing.created");
  assert.equal(state.auditLogs.at(-1).entityType, "VendorPricing");
});
