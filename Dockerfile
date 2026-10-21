FROM node:20-alpine

# Create secure non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app
RUN chown appuser:appgroup /app

USER appuser

# Set npm network resiliency against slow connection/timeouts
RUN npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000

# Install production dependencies only (skip heavy hardhat/dev tools)
COPY --chown=appuser:appgroup package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps && npm cache clean --force

# Copy prebuilt frontend, public assets, and backend server
COPY --chown=appuser:appgroup server ./server
COPY --chown=appuser:appgroup public ./public
COPY --chown=appuser:appgroup dist ./dist

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "server/server.js"]


