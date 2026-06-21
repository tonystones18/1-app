// Identity Service — Full Implementation
// Handles: authentication, session management, token issuance, password management

import type { RoleId } from "@visionesoft/permissions";
import type { TenantScope } from "@visionesoft/shared-types";

// ─── Token Types ─────────────────────────────────────────────────────────────

export interface JwtPayload {
  sub: string;
  email: string;
  roleId: RoleId;
  tenantId: string;
  tenantType: TenantScope["tenantType"];
  operatorId?: string;
  whiteLabelId?: string;
  sessionId: string;
  iat: number;
  exp: number;
  jti: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  tokenType: "Bearer";
}

// ─── Session ──────────────────────────────────────────────────────────────────

export interface SessionRecord {
  id: string;
  userId: string;
  tenantId: string;
  roleId: RoleId;
  scope: TenantScope;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
  expiresAt: string;
  createdAt: string;
  lastActiveAt: string;
}

// ─── Auth Inputs / Results ────────────────────────────────────────────────────

export interface LoginInput {
  email: string;
  password: string;
  mfaCode?: string;
  ipAddress: string;
  userAgent: string;
}

export interface LoginResult {
  tokens: TokenPair;
  session: SessionRecord;
  requiresMfa: boolean;
  mfaMethod?: "totp" | "recovery_code";
}

export interface RefreshTokenInput {
  refreshToken: string;
  ipAddress: string;
  userAgent: string;
}

export interface ChangePasswordInput {
  userId: string;
  tenantId: string;
  currentPassword: string;
  newPassword: string;
}

// ─── Password Utilities (Web Crypto API — zero external deps) ─────────────────

const PBKDF2_ITERATIONS = 600_000;
const SALT_BYTES = 32;

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt.buffer as ArrayBuffer, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    keyMaterial,
    { name: "HMAC", hash: "SHA-256", length: 256 },
    true,
    ["sign"]
  );
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const key = await deriveKey(password, salt);
  const exported = await crypto.subtle.exportKey("raw", key);
  const saltHex = Buffer.from(salt).toString("hex");
  const hashHex = Buffer.from(new Uint8Array(exported)).toString("hex");
  return `pbkdf2:${saltHex}:${hashHex}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const parts = storedHash.split(":");
  if (parts.length < 3 || parts[0] !== "pbkdf2") return false;
  const saltHex = parts[1] ?? "";
  const expectedHashHex = parts[2] ?? "";
  const salt = new Uint8Array(Buffer.from(saltHex, "hex"));
  const key = await deriveKey(password, salt);
  const exported = await crypto.subtle.exportKey("raw", key);
  const actualHashHex = Buffer.from(new Uint8Array(exported)).toString("hex");
  if (actualHashHex.length !== expectedHashHex.length) return false;
  let diff = 0;
  for (let i = 0; i < actualHashHex.length; i++) {
    diff |= (actualHashHex.charCodeAt(i)) ^ (expectedHashHex.charCodeAt(i) ?? 0);
  }
  return diff === 0;
}

// ─── JWT Utilities (HMAC-SHA256, Web Crypto) ──────────────────────────────────

function base64UrlEncode(data: ArrayBuffer | string): string {
  const bytes = typeof data === "string" ? new TextEncoder().encode(data) : new Uint8Array(data);
  const binary = Array.from(bytes).map((b) => String.fromCharCode(b)).join("");
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function base64UrlDecode(str: string): string {
  const padded = str + "=".repeat((4 - (str.length % 4)) % 4);
  return atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
}

async function getHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function signJwt(payload: JwtPayload, secret: string): Promise<string> {
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base64UrlEncode(JSON.stringify(payload));
  const signingInput = `${header}.${body}`;
  const key = await getHmacKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signingInput));
  return `${signingInput}.${base64UrlEncode(signature)}`;
}

export async function verifyJwt(token: string, secret: string): Promise<JwtPayload> {
  const parts = token.split(".");
  if (parts.length !== 3) throw new AuthError("INVALID_TOKEN", "Malformed JWT");
  const [header, body, sig] = parts as [string, string, string];
  const key = await getHmacKey(secret);
  const padded = sig + "=".repeat((4 - (sig.length % 4)) % 4);
  const sigBytes = Uint8Array.from(atob(padded.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));
  const valid = await crypto.subtle.verify("HMAC", key, sigBytes, new TextEncoder().encode(`${header}.${body}`));
  if (!valid) throw new AuthError("INVALID_TOKEN", "JWT signature invalid");
  const payload = JSON.parse(base64UrlDecode(body)) as JwtPayload;
  if (payload.exp < Math.floor(Date.now() / 1000)) throw new AuthError("SESSION_EXPIRED", "JWT expired");
  return payload;
}

export function buildJwtPayload(
  userId: string,
  email: string,
  roleId: RoleId,
  scope: TenantScope,
  sessionId: string,
  ttlSeconds: number
): JwtPayload {
  const now = Math.floor(Date.now() / 1000);
  const payload: JwtPayload = {
    sub: userId,
    email,
    roleId,
    tenantId: scope.tenantId,
    tenantType: scope.tenantType,
    sessionId,
    jti: crypto.randomUUID(),
    iat: now,
    exp: now + ttlSeconds
  };
  if (scope.operatorId !== undefined) payload.operatorId = scope.operatorId;
  if (scope.whiteLabelId !== undefined) payload.whiteLabelId = scope.whiteLabelId;
  return payload;
}

// ─── Session Store ────────────────────────────────────────────────────────────

export interface SessionStore {
  create(session: SessionRecord): Promise<void>;
  findById(id: string): Promise<SessionRecord | null>;
  invalidate(id: string): Promise<void>;
  invalidateAllForUser(userId: string): Promise<void>;
  refreshActivity(id: string): Promise<void>;
}

export class InMemorySessionStore implements SessionStore {
  private map = new Map<string, SessionRecord>();
  async create(s: SessionRecord): Promise<void> { this.map.set(s.id, s); }
  async findById(id: string): Promise<SessionRecord | null> { return this.map.get(id) ?? null; }
  async invalidate(id: string): Promise<void> {
    const s = this.map.get(id);
    if (s) this.map.set(id, { ...s, isActive: false });
  }
  async invalidateAllForUser(userId: string): Promise<void> {
    for (const [id, s] of this.map) {
      if (s.userId === userId) this.map.set(id, { ...s, isActive: false });
    }
  }
  async refreshActivity(id: string): Promise<void> {
    const s = this.map.get(id);
    if (s) this.map.set(id, { ...s, lastActiveAt: new Date().toISOString() });
  }
}

// ─── User Repository Interface ────────────────────────────────────────────────

export interface UserRecord {
  id: string;
  tenantId: string;
  email: string;
  displayName: string;
  roleId: RoleId;
  passwordHash: string;
  status: "active" | "suspended" | "locked";
  mfaEnabled: boolean;
  mfaSecret?: string;
  scope: TenantScope;
  createdAt: string;
  updatedAt: string;
}

export interface UserRepository {
  findByEmail(tenantId: string, email: string): Promise<UserRecord | null>;
  findById(userId: string): Promise<UserRecord | null>;
  updatePasswordHash(userId: string, hash: string): Promise<void>;
}

// ─── Identity Service ─────────────────────────────────────────────────────────

export interface IdentityServiceConfig {
  jwtSecret: string;
  accessTokenTtl: number;
  refreshTokenTtl: number;
}

export class IdentityService {
  constructor(
    private readonly users: UserRepository,
    private readonly sessions: SessionStore,
    private readonly config: IdentityServiceConfig
  ) {}

  async login(input: LoginInput): Promise<LoginResult> {
    const user = await this.users.findByEmail("platform", input.email);
    if (!user) throw new AuthError("INVALID_CREDENTIALS", "Invalid email or password");
    if (user.status !== "active") throw new AuthError("ACCOUNT_DISABLED", "Account is not active");

    const valid = await verifyPassword(input.password, user.passwordHash);
    if (!valid) throw new AuthError("INVALID_CREDENTIALS", "Invalid email or password");

    if (user.mfaEnabled && !input.mfaCode) {
      return { tokens: {} as TokenPair, session: {} as SessionRecord, requiresMfa: true, mfaMethod: "totp" };
    }

    const sessionId = crypto.randomUUID();
    const now = new Date().toISOString();
    const session: SessionRecord = {
      id: sessionId,
      userId: user.id,
      tenantId: user.tenantId,
      roleId: user.roleId,
      scope: user.scope,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      isActive: true,
      expiresAt: new Date(Date.now() + this.config.refreshTokenTtl * 1000).toISOString(),
      createdAt: now,
      lastActiveAt: now
    };

    await this.sessions.create(session);
    const tokens = await this.issueTokens(user, sessionId);
    return { tokens, session, requiresMfa: false };
  }

  async refresh(input: RefreshTokenInput): Promise<TokenPair> {
    const payload = await verifyJwt(input.refreshToken, this.config.jwtSecret);
    const session = await this.sessions.findById(payload.sessionId);
    if (!session?.isActive) throw new AuthError("SESSION_EXPIRED", "Session expired");
    const user = await this.users.findById(payload.sub);
    if (!user || user.status !== "active") throw new AuthError("ACCOUNT_DISABLED", "Account disabled");
    await this.sessions.refreshActivity(session.id);
    return this.issueTokens(user, session.id);
  }

  async logout(sessionId: string): Promise<void> {
    await this.sessions.invalidate(sessionId);
  }

  async logoutAll(userId: string): Promise<void> {
    await this.sessions.invalidateAllForUser(userId);
  }

  async changePassword(input: ChangePasswordInput): Promise<void> {
    const user = await this.users.findById(input.userId);
    if (!user || user.tenantId !== input.tenantId) throw new AuthError("NOT_FOUND", "User not found");
    const valid = await verifyPassword(input.currentPassword, user.passwordHash);
    if (!valid) throw new AuthError("INVALID_CREDENTIALS", "Current password is incorrect");
    validatePasswordStrength(input.newPassword);
    const hash = await hashPassword(input.newPassword);
    await this.users.updatePasswordHash(user.id, hash);
    await this.sessions.invalidateAllForUser(user.id);
  }

  private async issueTokens(user: UserRecord, sessionId: string): Promise<TokenPair> {
    const access = buildJwtPayload(user.id, user.email, user.roleId, user.scope, sessionId, this.config.accessTokenTtl);
    const refresh = buildJwtPayload(user.id, user.email, user.roleId, user.scope, sessionId, this.config.refreshTokenTtl);
    const [accessToken, refreshToken] = await Promise.all([
      signJwt(access, this.config.jwtSecret),
      signJwt(refresh, this.config.jwtSecret)
    ]);
    return {
      accessToken,
      refreshToken,
      expiresAt: new Date(Date.now() + this.config.accessTokenTtl * 1000).toISOString(),
      tokenType: "Bearer"
    };
  }
}

// ─── Auth Error ────────────────────────────────────────────────────────────────

export type AuthErrorCode =
  | "INVALID_CREDENTIALS"
  | "ACCOUNT_DISABLED"
  | "SESSION_EXPIRED"
  | "INVALID_TOKEN"
  | "NOT_FOUND"
  | "MFA_REQUIRED"
  | "WEAK_PASSWORD";

export class AuthError extends Error {
  constructor(public readonly code: AuthErrorCode, message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export function validatePasswordStrength(password: string): void {
  if (password.length < 12) throw new AuthError("WEAK_PASSWORD", "Password must be at least 12 characters");
  if (!/[A-Z]/.test(password)) throw new AuthError("WEAK_PASSWORD", "Password must contain an uppercase letter");
  if (!/[a-z]/.test(password)) throw new AuthError("WEAK_PASSWORD", "Password must contain a lowercase letter");
  if (!/[0-9]/.test(password)) throw new AuthError("WEAK_PASSWORD", "Password must contain a number");
  if (!/[^A-Za-z0-9]/.test(password)) throw new AuthError("WEAK_PASSWORD", "Password must contain a special character");
}

export async function validateBearerToken(header: string | undefined, secret: string): Promise<JwtPayload> {
  if (!header?.startsWith("Bearer ")) throw new AuthError("INVALID_TOKEN", "Missing Authorization header");
  return verifyJwt(header.slice(7), secret);
}
