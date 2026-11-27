# ==========================================
# 1. Build Client Frontend
# ==========================================
FROM node:20-alpine AS client-builder
WORKDIR /app/client

COPY client/package*.json ./
RUN npm install

COPY client/ ./
RUN npm run build

# ==========================================
# 2. Server & Production Runtime
# ==========================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install server dependencies
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm ci --omit=dev

# Copy server application files
COPY server/ ./

# Copy built frontend assets from builder stage
COPY --from=client-builder /app/client/dist /app/client/dist

# Persistent directory for uploaded files
RUN mkdir -p /app/uploads

EXPOSE 5000

CMD ["node", "src/server.js"]
