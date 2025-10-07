ARG NODE_VERSION=22

################################

FROM node:${NODE_VERSION} AS dev

ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

RUN corepack enable

RUN pnpm config set store-dir /pnpm/store

EXPOSE 3000

CMD [ "sh", "-c", "pnpm install && pnpm run dev" ]

########################################

FROM node:${NODE_VERSION}-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="${PNPM_HOME}:${PATH}"
ENV NEXT_TELEMETRY_DISABLED=1

RUN apk add --no-cache libc6-compat

RUN corepack enable

WORKDIR /app

#################

FROM base AS deps
COPY package.json pnpm-lock.yaml* .npmrc* ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

##################

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm run build

#########

FROM base AS runner

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=build /app/public ./public

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]