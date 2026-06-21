import { PrismaClient } from "@prisma/client";

export interface DatabaseClientOptions {
  logQueries?: boolean;
}

export function createDatabaseClient(options: DatabaseClientOptions = {}): PrismaClient {
  return new PrismaClient({
    log: options.logQueries ? ["query", "error", "warn"] : ["error", "warn"]
  });
}

export type DatabaseClient = ReturnType<typeof createDatabaseClient>;
