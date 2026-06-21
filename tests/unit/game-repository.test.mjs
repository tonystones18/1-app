import assert from "node:assert/strict";
import test from "node:test";
import {
  GameRepository,
  GameServiceError,
  normalizeGameCategory,
  validateCreateGameInput
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

function createGameDatabase() {
  const state = {
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
    games: [],
    auditLogs: [],
    outboxEvents: [],
    idempotencyKeys: new Map()
  };

  const transactionClient = {
    provider: {
      async findUnique(args) {
        return state.providers.find((provider) => provider.id === args.where.id) ?? null;
      }
    },
    game: {
      async create(args) {
        const now = new Date("2026-06-20T00:00:00.000Z");
        const game = {
          id: `game-${state.games.length + 1}`,
          tenantId: args.data.tenantId,
          providerId: args.data.providerId,
          externalId: args.data.externalId,
          name: args.data.name,
          category: args.data.category,
          status: "DRAFT",
          rtpBps: args.data.rtpBps ?? null,
          volatility: args.data.volatility ?? null,
          metadata: args.data.metadata ?? null,
          createdAt: now,
          updatedAt: now
        };
        state.games.push(game);
        return game;
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
    game: {
      async findMany(args) {
        return state.games
          .filter((game) => game.tenantId === args.where.tenantId)
          .filter((game) => !args.where.providerId || game.providerId === args.where.providerId)
          .filter((game) => !args.where.category || game.category === args.where.category)
          .filter((game) => !args.where.status || game.status === args.where.status);
      },
      async findUnique(args) {
        return state.games.find((game) => game.id === args.where.id) ?? null;
      }
    },
    async $transaction(operation) {
      return operation(transactionClient);
    }
  };

  return { db, state };
}

test("game category normalization is deterministic", () => {
  assert.equal(normalizeGameCategory(" Live Casino "), "live_casino");
});

test("game payload validation normalizes category and volatility", () => {
  assert.deepEqual(validateCreateGameInput({
    providerId: "provider-1",
    externalId: "sweet-bonanza",
    name: "Sweet Bonanza",
    category: "Video Slots",
    rtpBps: 9651,
    volatility: "High",
    metadata: {
      paylines: 20
    }
  }), {
    providerId: "provider-1",
    externalId: "sweet-bonanza",
    name: "Sweet Bonanza",
    category: "video_slots",
    rtpBps: 9651,
    volatility: "high",
    metadata: {
      paylines: 20
    }
  });
});

test("game payload validation rejects invalid RTP", () => {
  assert.throws(
    () => validateCreateGameInput({
      providerId: "provider-1",
      externalId: "game-1",
      name: "Game One",
      category: "slot",
      rtpBps: 10001
    }),
    (error) => error instanceof GameServiceError && error.statusCode === 400
  );
});

test("game creation writes game, audit log, outbox event, and idempotency result", async () => {
  const { db, state } = createGameDatabase();
  const repository = new GameRepository(db);

  const game = await repository.create({
    actor: actor(),
    requestId: "request-game",
    idempotencyKey: "game-create-0001"
  }, {
    providerId: "provider-1",
    externalId: "book-of-gold",
    name: "Book of Gold",
    category: "slots",
    rtpBps: 9600
  });

  assert.equal(game.providerId, "provider-1");
  assert.equal(game.category, "slots");
  assert.equal(state.games.length, 1);
  assert.equal(state.auditLogs.length, 1);
  assert.equal(state.outboxEvents.length, 1);
  assert.equal(state.outboxEvents[0].name, "game.created");
  assert.equal(state.idempotencyKeys.get("tenant-1:game-create-0001").status, "COMPLETED");
});

test("game creation returns stored response for idempotent replay", async () => {
  const { db, state } = createGameDatabase();
  const repository = new GameRepository(db);
  const context = {
    actor: actor(),
    requestId: "request-game",
    idempotencyKey: "game-create-0002"
  };
  const input = {
    providerId: "provider-1",
    externalId: "live-roulette",
    name: "Live Roulette",
    category: "live casino"
  };

  const first = await repository.create(context, input);
  const second = await repository.create(context, input);

  assert.deepEqual(second, first);
  assert.equal(state.games.length, 1);
});

test("game creation rejects a provider outside actor tenant scope", async () => {
  const { db } = createGameDatabase();
  const repository = new GameRepository(db);

  await assert.rejects(
    repository.create({
      actor: actor(),
      requestId: "request-game",
      idempotencyKey: "game-create-0003"
    }, {
      providerId: "provider-foreign",
      externalId: "foreign-game",
      name: "Foreign Game",
      category: "slots"
    }),
    (error) => error instanceof GameServiceError && error.statusCode === 404
  );
});

test("game list filters by provider and category", async () => {
  const { db } = createGameDatabase();
  const repository = new GameRepository(db);

  await repository.create({
    actor: actor(),
    requestId: "request-game-1",
    idempotencyKey: "game-create-0004"
  }, {
    providerId: "provider-1",
    externalId: "slot-1",
    name: "Slot One",
    category: "slots"
  });
  await repository.create({
    actor: actor(),
    requestId: "request-game-2",
    idempotencyKey: "game-create-0005"
  }, {
    providerId: "provider-1",
    externalId: "table-1",
    name: "Table One",
    category: "table games"
  });

  const games = await repository.list({
    tenantId: "tenant-1",
    providerId: "provider-1",
    category: "table games",
    limit: 50
  });

  assert.equal(games.length, 1);
  assert.equal(games[0].externalId, "table-1");
});
