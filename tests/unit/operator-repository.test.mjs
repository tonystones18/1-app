import assert from "node:assert/strict";
import test from "node:test";
import {
  AgentRepository,
  OperatorRepository,
  OperatorServiceError,
  normalizeAgentCode,
  normalizeOperatorCode,
  validateAssignOperatorToAgentInput,
  validateCreateOperatorInput
} from "../../services/operator-service/dist/index.js";

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

function createOperatorDatabase() {
  const state = {
    operators: [],
    agents: [],
    assignments: [],
    auditLogs: [],
    outboxEvents: [],
    idempotencyKeys: new Map()
  };

  const transactionClient = {
    operator: {
      async create(args) {
        const now = new Date("2026-06-20T00:00:00.000Z");
        const operator = {
          id: `operator-${state.operators.length + 1}`,
          tenantId: args.data.tenantId,
          code: args.data.code,
          name: args.data.name,
          status: "DRAFT",
          metadata: args.data.metadata ?? null,
          createdAt: now,
          updatedAt: now
        };
        state.operators.push(operator);
        return operator;
      },
      async findUnique(args) {
        return state.operators.find((operator) => operator.id === args.where.id) ?? null;
      }
    },
    agent: {
      async create(args) {
        const now = new Date("2026-06-20T00:00:00.000Z");
        const agent = {
          id: `agent-${state.agents.length + 1}`,
          tenantId: args.data.tenantId,
          code: args.data.code,
          name: args.data.name,
          status: "DRAFT",
          metadata: args.data.metadata ?? null,
          createdAt: now,
          updatedAt: now
        };
        state.agents.push(agent);
        return agent;
      },
      async findUnique(args) {
        return state.agents.find((agent) => agent.id === args.where.id) ?? null;
      }
    },
    agentOperator: {
      async create(args) {
        const now = new Date("2026-06-20T00:00:00.000Z");
        const assignment = {
          id: `assignment-${state.assignments.length + 1}`,
          tenantId: args.data.tenantId,
          agentId: args.data.agentId,
          operatorId: args.data.operatorId,
          status: "ACTIVE",
          createdAt: now,
          updatedAt: now
        };
        state.assignments.push(assignment);
        return assignment;
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
    operator: {
      async findMany(args) {
        return state.operators
          .filter((operator) => operator.tenantId === args.where.tenantId)
          .filter((operator) => !args.where.status || operator.status === args.where.status);
      },
      async findUnique(args) {
        return state.operators.find((operator) => operator.id === args.where.id) ?? null;
      }
    },
    agent: {
      async findMany(args) {
        return state.agents
          .filter((agent) => agent.tenantId === args.where.tenantId)
          .filter((agent) => !args.where.status || agent.status === args.where.status);
      },
      async findUnique(args) {
        return state.agents.find((agent) => agent.id === args.where.id) ?? null;
      }
    },
    agentOperator: {
      async findMany(args) {
        return state.assignments
          .filter((assignment) => assignment.tenantId === args.where.tenantId)
          .filter((assignment) => !args.where.agentId || assignment.agentId === args.where.agentId)
          .filter((assignment) => !args.where.operatorId || assignment.operatorId === args.where.operatorId)
          .filter((assignment) => !args.where.status || assignment.status === args.where.status);
      }
    },
    async $transaction(operation) {
      return operation(transactionClient);
    }
  };

  return { db, state };
}

test("operator and agent code normalization is deterministic", () => {
  assert.equal(normalizeOperatorCode(" Royal Casino "), "ROYAL_CASINO");
  assert.equal(normalizeAgentCode(" mena agent "), "MENA_AGENT");
});

test("operator payload validation rejects malformed payloads", () => {
  assert.throws(
    () => validateCreateOperatorInput({ code: "O" }),
    (error) => error instanceof OperatorServiceError && error.statusCode === 400
  );
});

test("operator creation writes audit, outbox, and idempotency result", async () => {
  const { db, state } = createOperatorDatabase();
  const repository = new OperatorRepository(db);

  const operator = await repository.create({
    actor: actor(),
    requestId: "request-operator",
    idempotencyKey: "operator-create-0001"
  }, {
    code: "royal",
    name: "Royal Casino",
    metadata: {
      market: "global"
    }
  });

  assert.equal(operator.code, "ROYAL");
  assert.equal(state.operators.length, 1);
  assert.equal(state.auditLogs.at(-1).entityType, "Operator");
  assert.equal(state.outboxEvents.at(-1).name, "operator.created");
  assert.equal(state.idempotencyKeys.get("tenant-1:operator-create-0001").status, "COMPLETED");
});

test("agent creation returns stored response for idempotent replay", async () => {
  const { db, state } = createOperatorDatabase();
  const repository = new AgentRepository(db);
  const context = {
    actor: actor(),
    requestId: "request-agent",
    idempotencyKey: "agent-create-0001"
  };
  const input = {
    code: "mena",
    name: "MENA Agent"
  };

  const first = await repository.create(context, input);
  const second = await repository.create(context, input);

  assert.deepEqual(second, first);
  assert.equal(state.agents.length, 1);
  assert.equal(state.outboxEvents.at(-1).name, "agent.created");
});

test("assignment validation requires operator id", () => {
  assert.throws(
    () => validateAssignOperatorToAgentInput({}),
    (error) => error instanceof OperatorServiceError && error.statusCode === 400
  );
});

test("agent operator assignment writes audit and outbox records", async () => {
  const { db, state } = createOperatorDatabase();
  const operatorRepository = new OperatorRepository(db);
  const agentRepository = new AgentRepository(db);
  const operator = await operatorRepository.create({
    actor: actor(),
    requestId: "request-operator",
    idempotencyKey: "operator-create-0002"
  }, {
    code: "casino-one",
    name: "Casino One"
  });
  const agent = await agentRepository.create({
    actor: actor(),
    requestId: "request-agent",
    idempotencyKey: "agent-create-0002"
  }, {
    code: "agent-one",
    name: "Agent One"
  });

  const assignment = await agentRepository.assignOperator({
    actor: actor(),
    requestId: "request-assignment",
    idempotencyKey: "assignment-create-0001"
  }, agent.id, {
    operatorId: operator.id
  });

  assert.equal(assignment.agentId, agent.id);
  assert.equal(assignment.operatorId, operator.id);
  assert.equal(state.assignments.length, 1);
  assert.equal(state.auditLogs.at(-1).entityType, "AgentOperator");
  assert.equal(state.outboxEvents.at(-1).name, "agent.operator.assigned");
});

test("agent assignment rejects operator outside tenant scope", async () => {
  const { db, state } = createOperatorDatabase();
  const agentRepository = new AgentRepository(db);
  const agent = await agentRepository.create({
    actor: actor(),
    requestId: "request-agent",
    idempotencyKey: "agent-create-0003"
  }, {
    code: "agent-two",
    name: "Agent Two"
  });
  state.operators.push({
    id: "operator-foreign",
    tenantId: "tenant-2",
    code: "FOREIGN",
    name: "Foreign Operator",
    status: "DRAFT",
    metadata: null,
    createdAt: new Date("2026-06-20T00:00:00.000Z"),
    updatedAt: new Date("2026-06-20T00:00:00.000Z")
  });

  await assert.rejects(
    agentRepository.assignOperator({
      actor: actor(),
      requestId: "request-assignment",
      idempotencyKey: "assignment-create-0002"
    }, agent.id, {
      operatorId: "operator-foreign"
    }),
    (error) => error instanceof OperatorServiceError && error.statusCode === 404
  );
});

test("agent assignment list returns active assignments for one agent", async () => {
  const { db } = createOperatorDatabase();
  const operatorRepository = new OperatorRepository(db);
  const agentRepository = new AgentRepository(db);
  const operator = await operatorRepository.create({
    actor: actor(),
    requestId: "request-operator",
    idempotencyKey: "operator-create-0003"
  }, {
    code: "casino-two",
    name: "Casino Two"
  });
  const agent = await agentRepository.create({
    actor: actor(),
    requestId: "request-agent",
    idempotencyKey: "agent-create-0004"
  }, {
    code: "agent-three",
    name: "Agent Three"
  });

  await agentRepository.assignOperator({
    actor: actor(),
    requestId: "request-assignment",
    idempotencyKey: "assignment-create-0003"
  }, agent.id, {
    operatorId: operator.id
  });

  const assignments = await agentRepository.listAssignments("tenant-1", agent.id);

  assert.equal(assignments.length, 1);
  assert.equal(assignments[0].operatorId, operator.id);
});
