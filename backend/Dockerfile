# ── ClaimIQ Backend Docker Image ──────────────────────
# Node 20 LTS on Alpine for a minimal footprint
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy dependency manifests first (layer-cache for npm ci)
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/

# Expose the API port
EXPOSE 3000

# Start the server
CMD ["node", "src/index.js"]
