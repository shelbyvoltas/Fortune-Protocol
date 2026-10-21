FROM node:20-slim

WORKDIR /app

# Set npm network resiliency against slow connection/timeouts
RUN npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000

# Install production dependencies only (skip heavy dev tools)
COPY package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps && npm cache clean --force

# Copy prebuilt frontend, public assets, and backend server
COPY server ./server
COPY public ./public
COPY dist ./dist

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "server/server.js"]



