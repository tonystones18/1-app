import type { DomainEntity } from "@visionesoft/shared-types";
export * from "./games.js";
export * from "./providers.js";

export interface Provider extends DomainEntity {
  code: string;
  name: string;
  status: "draft" | "active" | "suspended";
}

export interface Vendor extends DomainEntity {
  code: string;
  name: string;
  status: "draft" | "active" | "suspended";
}

export interface Operator extends DomainEntity {
  code: string;
  name: string;
  status: "draft" | "active" | "suspended";
}

export const aggregatorDomains = ["providers", "vendors", "games", "operators", "agents"] as const;
