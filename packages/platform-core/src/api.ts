import type { IncomingMessage, ServerResponse } from "node:http";
import { can, type PermissionAction, type PermissionResource } from "@visionesoft/permissions";
import type { ActorContext, ApiEnvelope } from "@visionesoft/shared-types";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiRequestContext {
  requestId: string;
  method: HttpMethod;
  path: string;
  actor?: ActorContext;
  params: Record<string, string>;
  query: URLSearchParams;
}

export interface ApiRoute {
  method: HttpMethod;
  path: string;
  permission?: {
    resource: PermissionResource;
    action: PermissionAction;
  };
  handler: (context: ApiRequestContext, request: IncomingMessage) => Promise<unknown> | unknown;
}

export interface IdempotencyHeader {
  key: string;
}

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code: string
  ) {
    super(message);
  }
}

interface CompiledRoute {
  route: ApiRoute;
  parts: string[];
}

export class ApiRouter {
  private readonly routes: CompiledRoute[] = [];

  register(route: ApiRoute): void {
    this.routes.push({ route, parts: route.path.split("/").filter(Boolean) });
  }

  async handle(request: IncomingMessage, response: ServerResponse): Promise<void> {
    const requestId = request.headers["x-request-id"]?.toString() ?? crypto.randomUUID();
    const url = new URL(request.url ?? "/", "http://localhost");
    const method = normalizeMethod(request.method);

    try {
      const match = this.match(method, url.pathname);

      if (!match) {
        throw new ApiError(404, "Route not found", "route_not_found");
      }

      const context: ApiRequestContext = {
        requestId,
        method,
        path: url.pathname,
        params: match.params,
        query: url.searchParams
      };
      const actor = parseActorContext(request);

      if (actor) {
        context.actor = actor;
      }

      if (match.route.permission) {
        assertPermission(context, match.route.permission.resource, match.route.permission.action);
      }

      const data = await match.route.handler(context, request);
      writeJson(response, 200, envelope(requestId, data));
    } catch (error) {
      const apiError = toApiError(error);
      writeJson(response, apiError.statusCode, envelope(requestId, {
        code: apiError.code,
        message: apiError.message
      }));
    }
  }

  listRoutes(): Array<Pick<ApiRoute, "method" | "path" | "permission">> {
    return this.routes.map(({ route }) => {
      const listed: Pick<ApiRoute, "method" | "path" | "permission"> = {
        method: route.method,
        path: route.path
      };

      if (route.permission) {
        listed.permission = route.permission;
      }

      return listed;
    });
  }

  private match(method: HttpMethod, path: string): { route: ApiRoute; params: Record<string, string> } | undefined {
    const parts = path.split("/").filter(Boolean);

    for (const compiled of this.routes) {
      if (compiled.route.method !== method || compiled.parts.length !== parts.length) {
        continue;
      }

      const params: Record<string, string> = {};
      let matched = true;

      for (let index = 0; index < compiled.parts.length; index += 1) {
        const expected = compiled.parts[index];
        const actual = parts[index];

        if (!expected || !actual) {
          matched = false;
          break;
        }

        if (expected.startsWith(":")) {
          params[expected.slice(1)] = actual;
          continue;
        }

        if (expected !== actual) {
          matched = false;
          break;
        }
      }

      if (matched) {
        return { route: compiled.route, params };
      }
    }

    return undefined;
  }
}

export function assertPermission(context: ApiRequestContext, resource: PermissionResource, action: PermissionAction): void {
  if (!context.actor) {
    throw new ApiError(401, "Authentication required", "authentication_required");
  }

  if (!can(context.actor, resource, action)) {
    throw new ApiError(403, "Permission denied", "permission_denied");
  }
}

export function envelope<TData>(requestId: string, data: TData): ApiEnvelope<TData> {
  return { requestId, data };
}

export async function readJsonBody<TBody>(request: IncomingMessage): Promise<TBody> {
  const chunks: Buffer[] = [];

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  if (chunks.length === 0) {
    throw new ApiError(400, "Request body is required", "body_required");
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8")) as TBody;
  } catch {
    throw new ApiError(400, "Invalid JSON body", "invalid_json_body");
  }
}

export function requireActor(context: ApiRequestContext): ActorContext {
  if (!context.actor) {
    throw new ApiError(401, "Authentication required", "authentication_required");
  }

  return context.actor;
}

export function requireIdempotencyKey(request: IncomingMessage): IdempotencyHeader {
  const key = request.headers["idempotency-key"]?.toString().trim();

  if (!key) {
    throw new ApiError(400, "Idempotency-Key header is required", "idempotency_key_required");
  }

  if (key.length < 12 || key.length > 128) {
    throw new ApiError(400, "Idempotency-Key header length is invalid", "invalid_idempotency_key");
  }

  return { key };
}

function normalizeMethod(method: string | undefined): HttpMethod {
  const normalized = (method ?? "GET").toUpperCase();

  if (["GET", "POST", "PUT", "PATCH", "DELETE"].includes(normalized)) {
    return normalized as HttpMethod;
  }

  throw new ApiError(405, "Method not allowed", "method_not_allowed");
}

function parseActorContext(request: IncomingMessage): ActorContext | undefined {
  const encoded = request.headers["x-actor-context"]?.toString();

  if (!encoded) {
    return undefined;
  }

  try {
    return JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as ActorContext;
  } catch {
    throw new ApiError(400, "Invalid actor context", "invalid_actor_context");
  }
}

function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (isApiErrorLike(error)) {
    return new ApiError(error.statusCode, error.message, error.code);
  }

  if (error instanceof Error) {
    return new ApiError(500, error.message, "internal_error");
  }

  return new ApiError(500, "Unknown error", "internal_error");
}

function isApiErrorLike(error: unknown): error is { statusCode: number; message: string; code: string } {
  return Boolean(error) &&
    typeof error === "object" &&
    typeof (error as { statusCode?: unknown }).statusCode === "number" &&
    typeof (error as { message?: unknown }).message === "string" &&
    typeof (error as { code?: unknown }).code === "string";
}

function writeJson(response: ServerResponse, statusCode: number, body: unknown): void {
  response.writeHead(statusCode, { "content-type": "application/json" });
  response.end(JSON.stringify(body));
}
