FROM node:22-alpine AS base
WORKDIR /app
RUN npm install -g pnpm@9

# Install dependencies
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY services/api-gateway/package.json ./services/api-gateway/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/permissions/package.json ./packages/permissions/
COPY packages/database/package.json ./packages/database/
COPY packages/audit/package.json ./packages/audit/
COPY packages/platform-core/package.json ./packages/platform-core/
RUN pnpm install --frozen-lockfile

# Build
FROM deps AS builder
COPY tsconfig.base.json ./
COPY packages ./packages
COPY services/api-gateway ./services/api-gateway
COPY database/prisma ./database/prisma
RUN pnpm --filter @visionesoft/shared-types build
RUN pnpm --filter @visionesoft/permissions build
RUN pnpm --filter @visionesoft/database build
RUN pnpm --filter @visionesoft/audit build
RUN pnpm --filter @visionesoft/api-gateway build

# Production
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN npm install -g pnpm@9
COPY --from=builder /app/services/api-gateway/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/database/prisma ./database/prisma
EXPOSE 3000
CMD ["node", "dist/main.js"]
