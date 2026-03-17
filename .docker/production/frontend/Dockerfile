FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS deps
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

FROM base AS builder

ARG NEXT_PUBLIC_API_ENDPOINT
ARG NEXT_PUBLIC_URL
ARG NEXT_PUBLIC_GOOGLE_AUTHORIZED_REDIRECT_URI
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ARG NEXT_APP_ENV=production

ENV NEXT_PUBLIC_API_ENDPOINT=$NEXT_PUBLIC_API_ENDPOINT \
	NEXT_PUBLIC_URL=$NEXT_PUBLIC_URL \
	NEXT_PUBLIC_GOOGLE_AUTHORIZED_REDIRECT_URI=$NEXT_PUBLIC_GOOGLE_AUTHORIZED_REDIRECT_URI \
	NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID \
	NEXT_APP_ENV=$NEXT_APP_ENV

COPY --from=deps /app/node_modules ./node_modules
COPY frontend/ ./

ENV NODE_ENV=production
RUN npm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

RUN addgroup -S -g 1001 nodejs \
	&& adduser -S -u 1001 nextjs

COPY --from=builder /app/public ./public

RUN mkdir .next \
	&& chown nextjs:nodejs .next

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
