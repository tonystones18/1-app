FROM node:22-alpine AS base
WORKDIR /app
RUN npm install -g pnpm@9

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backoffice/package.json ./apps/backoffice/
RUN pnpm install --frozen-lockfile

FROM deps AS builder
COPY apps/backoffice ./apps/backoffice
WORKDIR /app/apps/backoffice
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

FROM node:22-alpine AS runner
WORKDIR /app/apps/backoffice
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=builder /app/apps/backoffice/.next/standalone ./
COPY --from=builder /app/apps/backoffice/.next/static ./.next/static
COPY --from=builder /app/apps/backoffice/public ./public
EXPOSE 3001
ENV PORT=3001
CMD ["node", "server.js"]
