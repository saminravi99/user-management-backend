################################################################################
# BACKEND DOCKERFILE FOR USER MANAGEMENT APPLICATION (NODE.JS + TYPESCRIPT)
#
# WHY: We need a multi-stage build to keep the final image small and secure
#      TypeScript needs to be compiled to JavaScript, but we don't need the
#      compiler or source code in production
#
# WHAT: This creates a production-ready Node.js backend container that:
#       - Compiles TypeScript to JavaScript in a builder stage
#       - Copies only the compiled code to a clean production image
#       - Runs as a non-root user for security
#       - Includes health checks for monitoring
#
# HOW: Uses multi-stage Docker build:
#      Stage 1 (builder): Install all deps, compile TypeScript, remove dev deps
#      Stage 2 (production): Copy compiled code, run as minimal container
#
# WHERE: This runs as a Docker container, receives API requests from Nginx
#        Connects to MongoDB and Redis for data storage
#
# WHEN: Built during CI/CD, deployed alongside frontend and Nginx
#
# SIZE COMPARISON:
# Single-stage build: ~450MB (includes TypeScript, source code, dev tools)
# Multi-stage build: ~180MB (only compiled JavaScript and runtime)
################################################################################

################################################################################
# STAGE 1: BUILDER - Compile TypeScript and prepare dependencies
################################################################################
FROM node:20-alpine AS builder
# Explanation: Our build environment (temporary, discarded after compile)
# "node:20-alpine" = Node.js version 20 on Alpine Linux
# "AS builder" = Give this stage a name so we can reference it later
#
# Why Node 20:
# - LTS (Long Term Support) - stable, maintained until 2026
# - Performance improvements over v18 (faster JSON parsing, fetch API)
# - Modern JavaScript features (Top-level await, ES2023 support)
#
# Why Alpine:
# - Minimal size (~5MB base vs Ubuntu ~200MB)
# - Includes package manager (apk) for installing tools if needed
# - Same Node.js functionality as full Linux distro

################################################################################
# Set working directory in the container
################################################################################
WORKDIR /app
# Explanation: All subsequent commands run from this directory
# Creates /app if it doesn't exist
# All COPY commands will be relative to this directory
#
# Why /app:
# - Standard convention (easy for others to understand)
# - Clean separation from system directories
# - Avoids conflicts with OS files

################################################################################
# Copy package files for dependency installation
################################################################################
COPY package*.json ./
# Explanation: Copy package.json and package-lock.json to container
# The * is a wildcard that matches:
# - package.json (required)
# - package-lock.json (if exists, recommended for reproducible builds)
#
# Why copy these first before other code:
# Docker caches each layer - if package files don't change, it reuses the cached
# npm install layer instead of reinstalling everything. This makes builds faster.
#
# Example build sequence:
# 1st build: Copies package.json, installs deps (5 minutes)
# 2nd build (only code changed): Reuses cached deps, skips install (30 seconds)
# 3rd build (package.json changed): Reinstalls deps (5 minutes)

################################################################################
# Install ALL dependencies including development dependencies
################################################################################
RUN npm ci
# Explanation: Install dependencies from package-lock.json
# "npm ci" (clean install) vs "npm install":
# - ci = deletes node_modules first, fresh install
# - ci = uses exact versions from package-lock.json (reproducible)
# - ci = faster in CI/CD pipelines
# - ci = errors if package.json and package-lock.json are out of sync
#
# What gets installed:
# - dependencies: Runtime packages (express, mongoose, bcrypt, etc.)
# - devDependencies: Build tools (typescript, @types/*, ts-node, nodemon)
#
# Why install devDependencies here:
# We need TypeScript compiler to build the project
# These will be removed later before production stage

################################################################################
# Copy application source code
################################################################################
COPY . .
# Explanation: Copy everything from current directory to /app in container
# First dot (.) = source (your project directory on host machine)
# Second dot (.) = destination (/app in container, since that's WORKDIR)
#
# What gets copied:
# - src/ (TypeScript source code)
# - tsconfig.json (TypeScript compiler configuration)
# - .env.example (environment variable template)
# - Any other files in the project
#
# What does NOT get copied:
# - Files listed in .dockerignore (node_modules, .git, .env, dist/, etc.)
# - This prevents copying unnecessary files and keeps image smaller

################################################################################
# Compile TypeScript to JavaScript
################################################################################
RUN npm run build
# Explanation: Run the build script defined in package.json
# Typically: "build": "tsc" (runs TypeScript compiler)
#
# What happens:
# 1. TypeScript compiler (tsc) reads tsconfig.json
# 2. Compiles all .ts files from src/ to .js files in dist/
# 3. Includes type checking - build fails if type errors exist
# 4. May include other build steps (copying assets, etc.)
#
# Example transformation:
# src/server.ts (TypeScript) → dist/server.js (JavaScript)
# src/controllers/user.controller.ts → dist/controllers/user.controller.js
#
# Why compile:
# Node.js doesn't understand TypeScript natively
# We need JavaScript to run in production

################################################################################
# Remove development dependencies to reduce size
################################################################################
RUN npm prune --production
# Explanation: Delete all devDependencies from node_modules
# "npm prune --production" keeps only dependencies (not devDependencies)
#
# What gets removed:
# - typescript (~65MB)
# - @types/* packages (~20MB)
# - ts-node, nodemon, testing frameworks
# - Linters, formatters, build tools
#
# What stays:
# - express (web framework)
# - mongoose (MongoDB driver)
# - bcrypt (password hashing)
# - jsonwebtoken (JWT auth)
# - All runtime dependencies
#
# Size impact:
# Before prune: ~300MB node_modules
# After prune: ~150MB node_modules

################################################################################
# STAGE 2: PRODUCTION - Minimal runtime environment
################################################################################
FROM node:20-alpine AS production
# Explanation: Start fresh with a clean Node.js image
# This is our final image - only contains what's needed to run the app
# Everything from builder stage is left behind (source code, TypeScript, etc.)
#
# Why start fresh:
# - Smaller final image (no build tools, no source code)
# - Better security (less surface area for attackers)
# - Faster deployment (smaller images download faster)

################################################################################
# Install wget for health checks
################################################################################
RUN apk add --no-cache wget
# Explanation: Install wget utility using Alpine's package manager (apk)
# "apk add" = Alpine's equivalent of "apt-get install" on Ubuntu
# "--no-cache" = don't save the package index (saves ~5MB)
#
# Why wget:
# Used in HEALTHCHECK command to ping /health endpoint
# Verifies the app is responding to HTTP requests
#
# Alternative: curl (similar tool, wget is slightly smaller)

################################################################################
# Set working directory
################################################################################
WORKDIR /app
# Same as builder stage - all commands run from /app

################################################################################
# Create non-root user for security
################################################################################
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
# Explanation: Create a new user and group to run the application
# Running as non-root is a critical security practice
#
# Command breakdown:
# addgroup -g 1001 -S nodejs:
# - Create group named "nodejs"
# - GID (Group ID) = 1001 (arbitrary number, just needs to be unique)
# - -S = system group (no special meaning, just convention)
#
# adduser -S nodejs -u 1001:
# - Create user named "nodejs"
# - UID (User ID) = 1001 (matches GID for simplicity)
# - -S = system user (no password, can't login interactively)
#
# Why non-root:
# If attacker exploits your app and gets shell access:
# - As root: Can modify system files, install malware, access other containers
# - As nodejs: Limited to /app directory, can't sudo, minimal damage
#
# Real-world scenario:
# Vulnerability in Express allows command injection
# Attacker runs: rm -rf /
# As root: Deletes entire container filesystem
# As nodejs: Permission denied (can only delete files in /app)

################################################################################
# Copy package files for documentation
################################################################################
COPY package*.json ./
# Copy package.json to production image
# Not strictly necessary since we're copying node_modules
# But good for documentation (shows what versions are installed)

################################################################################
# Copy production dependencies from builder
################################################################################
COPY --from=builder /app/node_modules ./node_modules
# Explanation: Copy node_modules from builder stage to production stage
# "--from=builder" = Copy from the "builder" stage (not from host machine)
# Source: /app/node_modules (in builder container)
# Destination: ./node_modules (in production container = /app/node_modules)
#
# Why copy instead of reinstalling:
# - Faster: No need to download packages again
# - Consistent: Exact same packages that were used to build
# - Already pruned: devDependencies were removed in builder stage

################################################################################
# Copy compiled JavaScript code from builder
################################################################################
COPY --from=builder /app/dist ./dist
# Explanation: Copy the compiled JavaScript from builder stage
# /app/dist contains all .js files that TypeScript compiler generated
#
# What's in dist/:
# - server.js (entry point)
# - controllers/ (compiled controller files)
# - models/ (compiled Mongoose models)
# - routes/ (compiled route definitions)
# - middleware/ (compiled middleware functions)
# - config/ (compiled configuration)
#
# What's NOT in dist:
# - Original .ts source files (left in builder stage)
# - TypeScript compiler (not needed at runtime)
# - node_modules (copied separately above)

################################################################################
# Copy environment variable template
################################################################################
COPY --from=builder /app/.env.example ./.env.example
# Explanation: Copy example environment file for reference
# Not used at runtime (actual .env is provided by Docker Compose or Kubernetes)
# Useful for documentation - shows what env vars are expected

################################################################################
# Set correct file ownership
################################################################################
RUN chown -R nodejs:nodejs /app
# Explanation: Give nodejs user ownership of all files in /app
# "chown -R" = change ownership recursively (all files and subdirectories)
# "nodejs:nodejs" = user:group
#
# Why needed:
# Files were copied as root (default when building)
# nodejs user needs read access to run the app
# Without this, app would fail with "permission denied" errors
#
# What this allows:
# - nodejs user can read dist/server.js (required to run)
# - nodejs user can read node_modules/ (required for dependencies)
# - nodejs user can write to logs if app logs to files

################################################################################
# Switch to non-root user
################################################################################
USER nodejs
# Explanation: All subsequent commands run as nodejs user (not root)
# This applies to:
# - RUN commands (none after this in our Dockerfile)
# - CMD command (the app itself)
# - Any exec commands when container is running
#
# From this point forward, container has limited privileges
# The process running inside can only do what nodejs user is allowed to do

################################################################################
# Document which port the app uses
################################################################################
EXPOSE 5000
# Explanation: Indicate this container listens on port 5000
# This is documentation only - doesn't actually open the port
#
# Port 5000:
# Where our Express app listens (defined in server.ts)
# Nginx proxies requests to backend:5000
#
# Actual port mapping happens in docker-compose.yml:
# services:
#   backend:
#     ports:
#       - "5000:5000"  # Host:Container

################################################################################
# Health check - Monitor if application is running
################################################################################
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:5000/health || exit 1
# Explanation: Automated health monitoring
# Docker periodically checks if your app is healthy
#
# Parameters:
# --interval=30s: Check every 30 seconds
#   Why: Balance between quick detection and not spamming your app
#
# --timeout=5s: Health check must complete in 5 seconds
#   Why: API should respond quickly; >5s means something is wrong
#
# --start-period=30s: Don't check for first 30 seconds
#   Why: App needs time to:
#   - Connect to MongoDB (may need to retry if DB is still starting)
#   - Connect to Redis
#   - Load configurations
#   - Warm up caches
#
# --retries=3: Must fail 3 times before marking unhealthy
#   Why: Prevents false alarms (one timeout doesn't mean app is dead)
#
# The check command:
# wget --quiet --tries=1 --spider http://localhost:5000/health || exit 1
# - Hits your /health endpoint (you must implement this route!)
# - Should return 200 OK if app is healthy
# - Should check database connection, not just return "OK"
#
# Example /health implementation:
# app.get('/health', async (req, res) => {
#   try {
#     await mongoose.connection.db.admin().ping();
#     await redisClient.ping();
#     res.status(200).json({ status: 'healthy' });
#   } catch (error) {
#     res.status(503).json({ status: 'unhealthy' });
#   }
# });
#
# What happens when unhealthy:
# - Docker Compose: Can auto-restart container (restart: unless-stopped)
# - Kubernetes: Stops sending traffic, restarts pod
# - Monitoring: Triggers alerts
# - Load balancers: Removes from rotation

################################################################################
# Application startup command
################################################################################
CMD ["node", "dist/server.js"]
# Explanation: Command to run when container starts
# "node" = Node.js runtime
# "dist/server.js" = compiled JavaScript entry point
#
# What happens:
# 1. Container starts
# 2. Docker runs: node dist/server.js (as nodejs user)
# 3. Express app starts listening on port 5000
# 4. Connects to MongoDB and Redis
# 5. Container stays running until app crashes or is stopped
#
# Why dist/server.js:
# - This is the compiled output from src/server.ts
# - Contains all initialization code (DB connection, middleware, routes)
# - Starts Express server
#
# Alternative commands we're NOT using:
# CMD ["npm", "start"] - Extra process layer, slower
# CMD ["node", "src/server.ts"] - Can't run TypeScript directly
# CMD ["ts-node", "src/server.ts"] - Would need TypeScript in production (bad)
