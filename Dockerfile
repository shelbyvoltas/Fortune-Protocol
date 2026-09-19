# ─── Stage 1: Build Frontend & Tooling ─────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copy full source
COPY . .

# Build production React/Vite SPA bundle
RUN npm run build

# ─── Stage 2: Production Runtime ──────────────────────────
FROM node:20-alpine

# Create secure non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps && npm cache clean --force

# Copy runtime assets and server code
COPY --from=builder /app/server ./server
COPY --from=builder /app/public ./public
COPY --from=builder /app/dist ./dist

# Set ownership to unprivileged user
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "server/server.js"]
