import { createServer } from "node:http";
import {
  ApiError,
  ApiRouter,
  readJsonBody,
  requireActor,
  requireIdempotencyKey
} from "@visionesoft/platform-core";
import {
  GameRepository,
  ProviderRepository,
  validateCreateProviderContractInput,
  validateCreateGameInput,
  validateCreateProviderInput,
  validateCreateProviderPricingInput,
  validateRecordProviderHealthInput,
  type CreateProviderContractInput,
  type CreateProviderInput,
  type CreateProviderPricingInput,
  type GameDatabaseClient,
  type GameStatus,
  type ProviderDatabaseClient,
  type ProviderStatus,
  type RecordProviderHealthInput
} from "@visionesoft/aggregator-service";
import { createDatabaseClient } from "@visionesoft/database";
import {
  AgentRepository,
  OperatorRepository,
  validateAssignOperatorToAgentInput,
  validateCreateAgentInput,
  validateCreateOperatorInput,
  type AgentStatus,
  type OperatorDatabaseClient,
  type OperatorStatus
} from "@visionesoft/operator-service";
import {
  RouteRepository,
  validateCreateRouteGroupInput,
  validateCreateRoutePolicyInput,
  type ManagedRouteType,
  type RouteDatabaseClient,
  type RouteLifecycleStatus
} from "@visionesoft/routing-service";
import type { HealthSnapshot } from "@visionesoft/shared-types";
import {
  VendorRepository,
  validateCreateVendorContractInput,
  validateCreateVendorInput,
  validateCreateVendorPricingInput,
  type VendorDatabaseClient,
  type VendorStatus
} from "@visionesoft/vendor-service";

const serviceName = "api-gateway";
const version = "0.1.0";

const router = new ApiRouter();
const database = createDatabaseClient();
const agentRepository = new AgentRepository(database as unknown as OperatorDatabaseClient);
const gameRepository = new GameRepository(database as unknown as GameDatabaseClient);
const operatorRepository = new OperatorRepository(database as unknown as OperatorDatabaseClient);
const providerRepository = new ProviderRepository(database as unknown as ProviderDatabaseClient);
const routeRepository = new RouteRepository(database as unknown as RouteDatabaseClient);
const vendorRepository = new VendorRepository(database as unknown as VendorDatabaseClient);

router.register({
  method: "GET",
  path: "/health",
  handler: () => {
    const health: HealthSnapshot = {
      service: serviceName,
      status: "ok",
      version,
      checkedAt: new Date().toISOString()
    };

    return health;
  }
});

router.register({
  method: "GET",
  path: "/api/routes",
  permission: {
    resource: "configuration",
    action: "read"
  },
  handler: () => ({
    routes: router.listRoutes()
  })
});

router.register({
  method: "GET",
  path: "/api/routes/groups",
  permission: {
    resource: "route",
    action: "read"
  },
  handler: (context) => {
    const actor = requireActor(context);
    const status = parseRouteStatus(context.query.get("status"));
    const limit = Number(context.query.get("limit") ?? 50);
    const cursor = context.query.get("cursor") ?? undefined;

    return routeRepository.listGroups({
      tenantId: actor.scope.tenantId,
      ...(status ? { status } : {}),
      limit: Number.isFinite(limit) ? limit : 50,
      ...(cursor ? { cursor } : {})
    });
  }
});

router.register({
  method: "GET",
  path: "/api/routes/groups/:routeGroupId",
  permission: {
    resource: "route",
    action: "read"
  },
  handler: async (context) => {
    const actor = requireActor(context);
    const routeGroupId = requireRouteGroupId(context.params.routeGroupId);
    const group = await routeRepository.getGroupById(actor.scope.tenantId, routeGroupId);

    if (!group) {
      throw new ApiError(404, "Route group not found", "route_group_not_found");
    }

    return {
      group
    };
  }
});

router.register({
  method: "POST",
  path: "/api/routes/groups",
  permission: {
    resource: "route",
    action: "create"
  },
  handler: async (context, request) => {
    const actor = requireActor(context);
    const idempotency = requireIdempotencyKey(request);
    const body = await readJsonBody<unknown>(request);
    const input = validateCreateRouteGroupInput(body);
    const group = await routeRepository.createGroup({
      actor,
      requestId: context.requestId,
      idempotencyKey: idempotency.key
    }, input);

    return {
      group
    };
  }
});

router.register({
  method: "GET",
  path: "/api/routes/policies",
  permission: {
    resource: "route",
    action: "read"
  },
  handler: (context) => {
    const actor = requireActor(context);
    const routeType = parseRouteType(context.query.get("routeType"));
    const status = parseRouteStatus(context.query.get("status"));
    const routeGroupId = context.query.get("routeGroupId") ?? undefined;
    const operatorId = context.query.get("operatorId") ?? undefined;
    const providerId = context.query.get("providerId") ?? undefined;
    const limit = Number(context.query.get("limit") ?? 50);
    const cursor = context.query.get("cursor") ?? undefined;

    return routeRepository.listPolicies({
      tenantId: actor.scope.tenantId,
      ...(routeGroupId ? { routeGroupId } : {}),
      ...(operatorId ? { operatorId } : {}),
      ...(providerId ? { providerId } : {}),
      ...(routeType ? { routeType } : {}),
      ...(status ? { status } : {}),
      limit: Number.isFinite(limit) ? limit : 50,
      ...(cursor ? { cursor } : {})
    });
  }
});

router.register({
  method: "GET",
  path: "/api/routes/policies/:routePolicyId",
  permission: {
    resource: "route",
    action: "read"
  },
  handler: async (context) => {
    const actor = requireActor(context);
    const routePolicyId = requireRoutePolicyId(context.params.routePolicyId);
    const policy = await routeRepository.getPolicyById(actor.scope.tenantId, routePolicyId);

    if (!policy) {
      throw new ApiError(404, "Route policy not found", "route_policy_not_found");
    }

    return {
      policy
    };
  }
});

router.register({
  method: "POST",
  path: "/api/routes/policies",
  permission: {
    resource: "route",
    action: "create"
  },
  handler: async (context, request) => {
    const actor = requireActor(context);
    const idempotency = requireIdempotencyKey(request);
    const body = await readJsonBody<unknown>(request);
    const input = validateCreateRoutePolicyInput(body);
    const policy = await routeRepository.createPolicy({
      actor,
      requestId: context.requestId,
      idempotencyKey: idempotency.key
    }, input);

    return {
      policy
    };
  }
});

router.register({
  method: "GET",
  path: "/api/aggregator/providers",
  permission: {
    resource: "provider",
    action: "read"
  },
  handler: (context) => {
    const actor = requireActor(context);
    const status = parseProviderStatus(context.query.get("status"));
    const limit = Number(context.query.get("limit") ?? 50);
    const cursor = context.query.get("cursor") ?? undefined;

    return providerRepository.list({
      tenantId: actor.scope.tenantId,
      ...(status ? { status } : {}),
      limit: Number.isFinite(limit) ? limit : 50,
      ...(cursor ? { cursor } : {})
    });
  }
});

router.register({
  method: "GET",
  path: "/api/aggregator/providers/:providerId",
  permission: {
    resource: "provider",
    action: "read"
  },
  handler: async (context) => {
    const actor = requireActor(context);
    const providerId = requireProviderId(context.params.providerId);

    const provider = await providerRepository.getById(actor.scope.tenantId, providerId);

    if (!provider) {
      throw new ApiError(404, "Provider not found", "provider_not_found");
    }

    return {
      provider
    };
  }
});

router.register({
  method: "POST",
  path: "/api/aggregator/providers",
  permission: {
    resource: "provider",
    action: "create"
  },
  handler: async (context, request) => {
    const actor = requireActor(context);
    const idempotency = requireIdempotencyKey(request);
    const body = await readJsonBody<unknown>(request);
    const input = validateCreateProviderInput(body);
    const provider = await providerRepository.create({
      actor,
      requestId: context.requestId,
      idempotencyKey: idempotency.key
    }, input);

    return {
      provider
    };
  }
});

router.register({
  method: "GET",
  path: "/api/aggregator/providers/:providerId/contracts",
  permission: {
    resource: "provider",
    action: "read"
  },
  handler: (context) => {
    const actor = requireActor(context);
    const providerId = requireProviderId(context.params.providerId);
    const limit = Number(context.query.get("limit") ?? 50);

    return providerRepository.listContracts(actor.scope.tenantId, providerId, Number.isFinite(limit) ? limit : 50);
  }
});

router.register({
  method: "POST",
  path: "/api/aggregator/providers/:providerId/contracts",
  permission: {
    resource: "provider",
    action: "create"
  },
  handler: async (context, request) => {
    const actor = requireActor(context);
    const providerId = requireProviderId(context.params.providerId);
    const idempotency = requireIdempotencyKey(request);
    const body = await readJsonBody<unknown>(request);
    const input = validateCreateProviderContractInput(body);
    const contract = await providerRepository.createContract({
      actor,
      requestId: context.requestId,
      idempotencyKey: idempotency.key
    }, providerId, input);

    return {
      contract
    };
  }
});

router.register({
  method: "GET",
  path: "/api/aggregator/providers/:providerId/pricing",
  permission: {
    resource: "provider",
    action: "read"
  },
  handler: (context) => {
    const actor = requireActor(context);
    const providerId = requireProviderId(context.params.providerId);
    const currency = context.query.get("currency") ?? undefined;
    const limit = Number(context.query.get("limit") ?? 50);

    return providerRepository.listPricing(actor.scope.tenantId, providerId, currency, Number.isFinite(limit) ? limit : 50);
  }
});

router.register({
  method: "POST",
  path: "/api/aggregator/providers/:providerId/pricing",
  permission: {
    resource: "provider",
    action: "create"
  },
  handler: async (context, request) => {
    const actor = requireActor(context);
    const providerId = requireProviderId(context.params.providerId);
    const idempotency = requireIdempotencyKey(request);
    const body = await readJsonBody<unknown>(request);
    const input = validateCreateProviderPricingInput(body);
    const pricing = await providerRepository.createPricing({
      actor,
      requestId: context.requestId,
      idempotencyKey: idempotency.key
    }, providerId, input);

    return {
      pricing
    };
  }
});

router.register({
  method: "GET",
  path: "/api/aggregator/providers/:providerId/health",
  permission: {
    resource: "provider",
    action: "read"
  },
  handler: (context) => {
    const actor = requireActor(context);
    const providerId = requireProviderId(context.params.providerId);
    const limit = Number(context.query.get("limit") ?? 50);

    return providerRepository.listHealth(actor.scope.tenantId, providerId, Number.isFinite(limit) ? limit : 50);
  }
});

router.register({
  method: "POST",
  path: "/api/aggregator/providers/:providerId/health",
  permission: {
    resource: "provider",
    action: "create"
  },
  handler: async (context, request) => {
    const actor = requireActor(context);
    const providerId = requireProviderId(context.params.providerId);
    const idempotency = requireIdempotencyKey(request);
    const body = await readJsonBody<unknown>(request);
    const input = validateRecordProviderHealthInput(body);
    const health = await providerRepository.recordHealth({
      actor,
      requestId: context.requestId,
      idempotencyKey: idempotency.key
    }, providerId, input);

    return {
      health
    };
  }
});

router.register({
  method: "GET",
  path: "/api/aggregator/games",
  permission: {
    resource: "game",
    action: "read"
  },
  handler: (context) => {
    const actor = requireActor(context);
    const status = parseGameStatus(context.query.get("status"));
    const providerId = context.query.get("providerId") ?? undefined;
    const category = context.query.get("category") ?? undefined;
    const limit = Number(context.query.get("limit") ?? 50);
    const cursor = context.query.get("cursor") ?? undefined;

    return gameRepository.list({
      tenantId: actor.scope.tenantId,
      ...(providerId ? { providerId } : {}),
      ...(category ? { category } : {}),
      ...(status ? { status } : {}),
      limit: Number.isFinite(limit) ? limit : 50,
      ...(cursor ? { cursor } : {})
    });
  }
});

router.register({
  method: "GET",
  path: "/api/aggregator/games/:gameId",
  permission: {
    resource: "game",
    action: "read"
  },
  handler: async (context) => {
    const actor = requireActor(context);
    const gameId = requireGameId(context.params.gameId);

    const game = await gameRepository.getById(actor.scope.tenantId, gameId);

    if (!game) {
      throw new ApiError(404, "Game not found", "game_not_found");
    }

    return {
      game
    };
  }
});

router.register({
  method: "POST",
  path: "/api/aggregator/games",
  permission: {
    resource: "game",
    action: "create"
  },
  handler: async (context, request) => {
    const actor = requireActor(context);
    const idempotency = requireIdempotencyKey(request);
    const body = await readJsonBody<unknown>(request);
    const input = validateCreateGameInput(body);
    const game = await gameRepository.create({
      actor,
      requestId: context.requestId,
      idempotencyKey: idempotency.key
    }, input);

    return {
      game
    };
  }
});

router.register({
  method: "GET",
  path: "/api/aggregator/operators",
  permission: {
    resource: "operator",
    action: "read"
  },
  handler: (context) => {
    const actor = requireActor(context);
    const status = parseOperatorStatus(context.query.get("status"));
    const limit = Number(context.query.get("limit") ?? 50);
    const cursor = context.query.get("cursor") ?? undefined;

    return operatorRepository.list({
      tenantId: actor.scope.tenantId,
      ...(status ? { status } : {}),
      limit: Number.isFinite(limit) ? limit : 50,
      ...(cursor ? { cursor } : {})
    });
  }
});

router.register({
  method: "GET",
  path: "/api/aggregator/operators/:operatorId",
  permission: {
    resource: "operator",
    action: "read"
  },
  handler: async (context) => {
    const actor = requireActor(context);
    const operatorId = requireOperatorId(context.params.operatorId);
    const operator = await operatorRepository.getById(actor.scope.tenantId, operatorId);

    if (!operator) {
      throw new ApiError(404, "Operator not found", "operator_not_found");
    }

    return {
      operator
    };
  }
});

router.register({
  method: "POST",
  path: "/api/aggregator/operators",
  permission: {
    resource: "operator",
    action: "create"
  },
  handler: async (context, request) => {
    const actor = requireActor(context);
    const idempotency = requireIdempotencyKey(request);
    const body = await readJsonBody<unknown>(request);
    const input = validateCreateOperatorInput(body);
    const operator = await operatorRepository.create({
      actor,
      requestId: context.requestId,
      idempotencyKey: idempotency.key
    }, input);

    return {
      operator
    };
  }
});

router.register({
  method: "GET",
  path: "/api/aggregator/agents",
  permission: {
    resource: "agent",
    action: "read"
  },
  handler: (context) => {
    const actor = requireActor(context);
    const status = parseAgentStatus(context.query.get("status"));
    const limit = Number(context.query.get("limit") ?? 50);
    const cursor = context.query.get("cursor") ?? undefined;

    return agentRepository.list({
      tenantId: actor.scope.tenantId,
      ...(status ? { status } : {}),
      limit: Number.isFinite(limit) ? limit : 50,
      ...(cursor ? { cursor } : {})
    });
  }
});

router.register({
  method: "GET",
  path: "/api/aggregator/agents/:agentId",
  permission: {
    resource: "agent",
    action: "read"
  },
  handler: async (context) => {
    const actor = requireActor(context);
    const agentId = requireAgentId(context.params.agentId);
    const agent = await agentRepository.getById(actor.scope.tenantId, agentId);

    if (!agent) {
      throw new ApiError(404, "Agent not found", "agent_not_found");
    }

    return {
      agent
    };
  }
});

router.register({
  method: "POST",
  path: "/api/aggregator/agents",
  permission: {
    resource: "agent",
    action: "create"
  },
  handler: async (context, request) => {
    const actor = requireActor(context);
    const idempotency = requireIdempotencyKey(request);
    const body = await readJsonBody<unknown>(request);
    const input = validateCreateAgentInput(body);
    const agent = await agentRepository.create({
      actor,
      requestId: context.requestId,
      idempotencyKey: idempotency.key
    }, input);

    return {
      agent
    };
  }
});

router.register({
  method: "GET",
  path: "/api/aggregator/agents/:agentId/operators",
  permission: {
    resource: "agent",
    action: "read"
  },
  handler: (context) => {
    const actor = requireActor(context);
    const agentId = requireAgentId(context.params.agentId);
    const limit = Number(context.query.get("limit") ?? 50);

    return agentRepository.listAssignments(actor.scope.tenantId, agentId, Number.isFinite(limit) ? limit : 50);
  }
});

router.register({
  method: "POST",
  path: "/api/aggregator/agents/:agentId/operators",
  permission: {
    resource: "agent",
    action: "create"
  },
  handler: async (context, request) => {
    const actor = requireActor(context);
    const agentId = requireAgentId(context.params.agentId);
    const idempotency = requireIdempotencyKey(request);
    const body = await readJsonBody<unknown>(request);
    const input = validateAssignOperatorToAgentInput(body);
    const assignment = await agentRepository.assignOperator({
      actor,
      requestId: context.requestId,
      idempotencyKey: idempotency.key
    }, agentId, input);

    return {
      assignment
    };
  }
});

router.register({
  method: "GET",
  path: "/api/aggregator/vendors",
  permission: {
    resource: "vendor",
    action: "read"
  },
  handler: (context) => {
    const actor = requireActor(context);
    const status = parseVendorStatus(context.query.get("status"));
    const limit = Number(context.query.get("limit") ?? 50);
    const cursor = context.query.get("cursor") ?? undefined;

    return vendorRepository.list({
      tenantId: actor.scope.tenantId,
      ...(status ? { status } : {}),
      limit: Number.isFinite(limit) ? limit : 50,
      ...(cursor ? { cursor } : {})
    });
  }
});

router.register({
  method: "GET",
  path: "/api/aggregator/vendors/:vendorId",
  permission: {
    resource: "vendor",
    action: "read"
  },
  handler: async (context) => {
    const actor = requireActor(context);
    const vendorId = requireVendorId(context.params.vendorId);

    const vendor = await vendorRepository.getById(actor.scope.tenantId, vendorId);

    if (!vendor) {
      throw new ApiError(404, "Vendor not found", "vendor_not_found");
    }

    return {
      vendor
    };
  }
});

router.register({
  method: "POST",
  path: "/api/aggregator/vendors",
  permission: {
    resource: "vendor",
    action: "create"
  },
  handler: async (context, request) => {
    const actor = requireActor(context);
    const idempotency = requireIdempotencyKey(request);
    const body = await readJsonBody<unknown>(request);
    const input = validateCreateVendorInput(body);
    const vendor = await vendorRepository.create({
      actor,
      requestId: context.requestId,
      idempotencyKey: idempotency.key
    }, input);

    return {
      vendor
    };
  }
});

router.register({
  method: "GET",
  path: "/api/aggregator/vendors/:vendorId/contracts",
  permission: {
    resource: "vendor",
    action: "read"
  },
  handler: (context) => {
    const actor = requireActor(context);
    const vendorId = requireVendorId(context.params.vendorId);
    const limit = Number(context.query.get("limit") ?? 50);

    return vendorRepository.listContracts(actor.scope.tenantId, vendorId, Number.isFinite(limit) ? limit : 50);
  }
});

router.register({
  method: "POST",
  path: "/api/aggregator/vendors/:vendorId/contracts",
  permission: {
    resource: "vendor",
    action: "create"
  },
  handler: async (context, request) => {
    const actor = requireActor(context);
    const vendorId = requireVendorId(context.params.vendorId);
    const idempotency = requireIdempotencyKey(request);
    const body = await readJsonBody<unknown>(request);
    const input = validateCreateVendorContractInput(body);
    const contract = await vendorRepository.createContract({
      actor,
      requestId: context.requestId,
      idempotencyKey: idempotency.key
    }, vendorId, input);

    return {
      contract
    };
  }
});

router.register({
  method: "GET",
  path: "/api/aggregator/vendors/:vendorId/pricing",
  permission: {
    resource: "vendor",
    action: "read"
  },
  handler: (context) => {
    const actor = requireActor(context);
    const vendorId = requireVendorId(context.params.vendorId);
    const currency = context.query.get("currency") ?? undefined;
    const limit = Number(context.query.get("limit") ?? 50);

    return vendorRepository.listPricing(actor.scope.tenantId, vendorId, currency, Number.isFinite(limit) ? limit : 50);
  }
});

router.register({
  method: "POST",
  path: "/api/aggregator/vendors/:vendorId/pricing",
  permission: {
    resource: "vendor",
    action: "create"
  },
  handler: async (context, request) => {
    const actor = requireActor(context);
    const vendorId = requireVendorId(context.params.vendorId);
    const idempotency = requireIdempotencyKey(request);
    const body = await readJsonBody<unknown>(request);
    const input = validateCreateVendorPricingInput(body);
    const pricing = await vendorRepository.createPricing({
      actor,
      requestId: context.requestId,
      idempotencyKey: idempotency.key
    }, vendorId, input);

    return {
      pricing
    };
  }
});

const server = createServer((request, response) => {
  void router.handle(request, response);
});

const port = Number(process.env.PORT ?? 3000);

server.listen(port, () => {
  console.log(`${serviceName} listening on ${port}`);
});

function parseProviderStatus(status: string | null): ProviderStatus | undefined {
  if (!status) {
    return undefined;
  }

  if (status === "draft" || status === "active" || status === "suspended" || status === "archived") {
    return status;
  }

  throw new ApiError(400, "Invalid provider status filter", "invalid_provider_status_filter");
}

function requireProviderId(providerId: string | undefined): string {
  if (!providerId) {
    throw new ApiError(400, "Provider id is required", "provider_id_required");
  }

  return providerId;
}

function parseRouteStatus(status: string | null): RouteLifecycleStatus | undefined {
  if (!status) {
    return undefined;
  }

  if (status === "draft" || status === "active" || status === "suspended" || status === "archived") {
    return status;
  }

  throw new ApiError(400, "Invalid route status filter", "invalid_route_status_filter");
}

function parseRouteType(routeType: string | null): ManagedRouteType | undefined {
  if (!routeType) {
    return undefined;
  }

  if (routeType === "game_launch" || routeType === "wallet" || routeType === "callback" || routeType === "payment") {
    return routeType;
  }

  throw new ApiError(400, "Invalid route type filter", "invalid_route_type_filter");
}

function requireRouteGroupId(routeGroupId: string | undefined): string {
  if (!routeGroupId) {
    throw new ApiError(400, "Route group id is required", "route_group_id_required");
  }

  return routeGroupId;
}

function requireRoutePolicyId(routePolicyId: string | undefined): string {
  if (!routePolicyId) {
    throw new ApiError(400, "Route policy id is required", "route_policy_id_required");
  }

  return routePolicyId;
}

function parseGameStatus(status: string | null): GameStatus | undefined {
  if (!status) {
    return undefined;
  }

  if (status === "draft" || status === "active" || status === "suspended" || status === "archived") {
    return status;
  }

  throw new ApiError(400, "Invalid game status filter", "invalid_game_status_filter");
}

function requireGameId(gameId: string | undefined): string {
  if (!gameId) {
    throw new ApiError(400, "Game id is required", "game_id_required");
  }

  return gameId;
}

function parseOperatorStatus(status: string | null): OperatorStatus | undefined {
  if (!status) {
    return undefined;
  }

  if (status === "draft" || status === "active" || status === "suspended" || status === "archived") {
    return status;
  }

  throw new ApiError(400, "Invalid operator status filter", "invalid_operator_status_filter");
}

function requireOperatorId(operatorId: string | undefined): string {
  if (!operatorId) {
    throw new ApiError(400, "Operator id is required", "operator_id_required");
  }

  return operatorId;
}

function parseAgentStatus(status: string | null): AgentStatus | undefined {
  if (!status) {
    return undefined;
  }

  if (status === "draft" || status === "active" || status === "suspended" || status === "archived") {
    return status;
  }

  throw new ApiError(400, "Invalid agent status filter", "invalid_agent_status_filter");
}

function requireAgentId(agentId: string | undefined): string {
  if (!agentId) {
    throw new ApiError(400, "Agent id is required", "agent_id_required");
  }

  return agentId;
}

function parseVendorStatus(status: string | null): VendorStatus | undefined {
  if (!status) {
    return undefined;
  }

  if (status === "draft" || status === "active" || status === "suspended" || status === "archived") {
    return status;
  }

  throw new ApiError(400, "Invalid vendor status filter", "invalid_vendor_status_filter");
}

function requireVendorId(vendorId: string | undefined): string {
  if (!vendorId) {
    throw new ApiError(400, "Vendor id is required", "vendor_id_required");
  }

  return vendorId;
}
