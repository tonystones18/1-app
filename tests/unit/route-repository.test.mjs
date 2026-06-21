import assert from "node:assert/strict";
import test from "node:test";
import {
  RouteRepository,
  RouteServiceError,
  normalizeRouteGroupCode,
  validateCreateRoutePolicyInput
} from "../../services/routing-service/dist/index.js";

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

function createRouteDatabase() {
  const state = {
    routeGroups: [],
    routePolicies: [],
    providers: [
      {
        id: "provider-1",
        tenantId: "tenant-1"
      },
      {
        id: "provider-foreign",
        tenantId: "tenant-2"
      }
    ],
    operators: [
      {
        id: "operator-1",
        tenantId: "tenant-1"
      },
      {
        id: "operator-foreign",
        tenantId: "tenant-2"
      }
    ],
    auditLogs: [],
    outboxEvents: [],
    idempotencyKeys: new Map()
  };

  const transactionClient = {
    routeGroup: {
      async create(args) {
        const now = new Date("2026-06-20T00:00:00.000Z");
        const group = {
          id: `route-group-${state.routeGroups.length + 1}`,
          tenantId: args.data.tenantId,
          code: args.data.code,
          name: args.data.name,
          status: "DRAFT",
          createdAt: now,
          updatedAt: now
        };
        state.routeGroups.push(group);
        return group;
      },
      async findUnique(args) {
        return state.routeGroups.find((group) => group.id === args.where.id) ?? null;
      }
    },
    routePolicy: {
      async create(args) {
        const now = new Date("2026-06-20T00:00:00.000Z");
        const policy = {
          id: `route-policy-${state.routePolicies.length + 1}`,
          tenantId: args.data.tenantId,
          routeGroupId: args.data.routeGroupId ?? null,
          operatorId: args.data.operatorId ?? null,
          providerId: args.data.providerId,
          routeType: args.data.routeType,
          priority: args.data.priority,
          status: "DRAFT",
          conditions: args.data.conditions,
          createdAt: now,
          updatedAt: now
        };
        state.routePolicies.push(policy);
        return policy;
      }
    },
    provider: {
      async findUnique(args) {
        return state.providers.find((provider) => provider.id === args.where.id) ?? null;
      }
    },
    operator: {
      async findUnique(args) {
        return state.operators.find((operator) => operator.id === args.where.id) ?? null;
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
    routeGroup: {
      async findMany(args) {
        return state.routeGroups
          .filter((group) => group.tenantId === args.where.tenantId)
          .filter((group) => !args.where.status || group.status === args.where.status);
      },
      async findUnique(args) {
        return state.routeGroups.find((group) => group.id === args.where.id) ?? null;
      }
    },
    routePolicy: {
      async findMany(args) {
        return state.routePolicies
          .filter((policy) => policy.tenantId === args.where.tenantId)
          .filter((policy) => !args.where.routeGroupId || policy.routeGroupId === args.where.routeGroupId)
          .filter((policy) => !args.where.operatorId || policy.operatorId === args.where.operatorId)
          .filter((policy) => !args.where.providerId || policy.providerId === args.where.providerId)
          .filter((policy) => !args.where.routeType || policy.routeType === args.where.routeType)
          .filter((policy) => !args.where.status || policy.status === args.where.status);
      },
      async findUnique(args) {
        return state.routePolicies.find((policy) => policy.id === args.where.id) ?? null;
      }
    },
    async $transaction(operation) {
      return operation(transactionClient);
    }
  };

  return { db, state };
}

test("route group code normalization is deterministic", () => {
  assert.equal(normalizeRouteGroupCode(" casino premium "), "CASINO_PREMIUM");
});

test("route policy validation rejects invalid route type", () => {
  assert.throws(
    () => validateCreateRoutePolicyInput({
      providerId: "provider-1",
      routeType: "invalid",
      priority: "primary",
      conditions: {}
    }),
    (error) => error instanceof RouteServiceError && error.statusCode === 400
  );
});

test("route group creation writes audit, outbox, and idempotency result", async () => {
  const { db, state } = createRouteDatabase();
  const repository = new RouteRepository(db);

  const group = await repository.createGroup({
    actor: actor(),
    requestId: "request-group",
    idempotencyKey: "route-group-create-0001"
  }, {
    code: "casino premium",
    name: "Casino Premium"
  });

  assert.equal(group.code, "CASINO_PREMIUM");
  assert.equal(state.routeGroups.length, 1);
  assert.equal(state.auditLogs.at(-1).entityType, "RouteGroup");
  assert.equal(state.outboxEvents.at(-1).name, "route.group.created");
  assert.equal(state.idempotencyKeys.get("tenant-1:route-group-create-0001").status, "COMPLETED");
});

test("route group creation returns stored response for idempotent replay", async () => {
  const { db, state } = createRouteDatabase();
  const repository = new RouteRepository(db);
  const context = {
    actor: actor(),
    requestId: "request-group",
    idempotencyKey: "route-group-create-0002"
  };
  const input = {
    code: "asia route",
    name: "Asia Route"
  };

  const first = await repository.createGroup(context, input);
  const second = await repository.createGroup(context, input);

  assert.deepEqual(second, first);
  assert.equal(state.routeGroups.length, 1);
});

test("route policy creation validates linked entities and writes audit and outbox records", async () => {
  const { db, state } = createRouteDatabase();
  const repository = new RouteRepository(db);
  const group = await repository.createGroup({
    actor: actor(),
    requestId: "request-group",
    idempotencyKey: "route-group-create-0003"
  }, {
    code: "premium",
    name: "Premium Routes"
  });

  const policy = await repository.createPolicy({
    actor: actor(),
    requestId: "request-policy",
    idempotencyKey: "route-policy-create-0001"
  }, {
    routeGroupId: group.id,
    operatorId: "operator-1",
    providerId: "provider-1",
    routeType: "game_launch",
    priority: "primary",
    conditions: {
      country: ["BR", "MX"],
      currency: ["BRL", "MXN"]
    }
  });

  assert.equal(policy.routeGroupId, group.id);
  assert.equal(policy.routeType, "game_launch");
  assert.equal(policy.priority, "primary");
  assert.equal(state.routePolicies.length, 1);
  assert.equal(state.auditLogs.at(-1).entityType, "RoutePolicy");
  assert.equal(state.outboxEvents.at(-1).name, "route.policy.created");
});

test("route policy creation rejects provider outside tenant scope", async () => {
  const { db } = createRouteDatabase();
  const repository = new RouteRepository(db);

  await assert.rejects(
    repository.createPolicy({
      actor: actor(),
      requestId: "request-policy",
      idempotencyKey: "route-policy-create-0002"
    }, {
      providerId: "provider-foreign",
      routeType: "wallet",
      priority: "fallback",
      conditions: {}
    }),
    (error) => error instanceof RouteServiceError && error.statusCode === 404
  );
});

test("route policy creation rejects operator outside tenant scope", async () => {
  const { db } = createRouteDatabase();
  const repository = new RouteRepository(db);

  await assert.rejects(
    repository.createPolicy({
      actor: actor(),
      requestId: "request-policy",
      idempotencyKey: "route-policy-create-0003"
    }, {
      operatorId: "operator-foreign",
      providerId: "provider-1",
      routeType: "callback",
      priority: "backup",
      conditions: {}
    }),
    (error) => error instanceof RouteServiceError && error.statusCode === 404
  );
});

test("route policy list filters by route type and provider", async () => {
  const { db } = createRouteDatabase();
  const repository = new RouteRepository(db);
  await repository.createPolicy({
    actor: actor(),
    requestId: "request-policy-1",
    idempotencyKey: "route-policy-create-0004"
  }, {
    providerId: "provider-1",
    routeType: "payment",
    priority: "primary",
    conditions: {
      currency: ["USD"]
    }
  });
  await repository.createPolicy({
    actor: actor(),
    requestId: "request-policy-2",
    idempotencyKey: "route-policy-create-0005"
  }, {
    providerId: "provider-1",
    routeType: "callback",
    priority: "fallback",
    conditions: {}
  });

  const policies = await repository.listPolicies({
    tenantId: "tenant-1",
    providerId: "provider-1",
    routeType: "payment",
    limit: 50
  });

  assert.equal(policies.length, 1);
  assert.equal(policies[0].routeType, "payment");
});
