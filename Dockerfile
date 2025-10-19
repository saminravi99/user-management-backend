# ===========================================
# STAGE 1: Build Stage
# Compile TypeScript to JavaScript
# ===========================================
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm install

# Copy source code
COPY . .

# Build TypeScript code
RUN npm run build

# Remove dev dependencies to reduce size
RUN npm prune --production

# ===========================================
# STAGE 2: Production Stage
# Run the compiled application
# ===========================================
FROM node:20-alpine AS production

# Install wget for health checks
RUN apk add --no-cache wget

# Create app directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy package files
COPY package*.json ./

# Copy node_modules from builder (production only)
COPY --from=builder /app/node_modules ./node_modules

# Copy compiled code from builder
COPY --from=builder /app/dist ./dist

# Copy necessary files
COPY --from=builder /app/.env.example ./.env.example

# Change ownership to non-root user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5000

# Health check
# Tests if the app is responding on /health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:5000/health || exit 1

# Start the application
CMD ["node", "dist/server.js"]
