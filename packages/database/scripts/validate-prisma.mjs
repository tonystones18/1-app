import { spawnSync } from "node:child_process";

const env = {
  ...process.env,
  DATABASE_URL: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/visionesoft"
};

const result = spawnSync(
  "pnpm",
  ["exec", "prisma", "validate", "--schema", "../../database/prisma/schema.prisma"],
  {
    env,
    stdio: "inherit",
    shell: true
  }
);

process.exit(result.status ?? 1);
