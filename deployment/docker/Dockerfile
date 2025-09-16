# Vanitya Backend API Dockerfile
# Multi-stage build for production optimization

FROM node:18-alpine AS base

# Install security updates and dumb-init
RUN apk update && apk upgrade && \
    apk add --no-cache dumb-init && \
    rm -rf /var/cache/apk/*

# Create app directory
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S vanitya -u 1001

# Copy package files
COPY package*.json ./

# Development stage
FROM base AS development
ENV NODE_ENV=development

# Install all dependencies (including devDependencies)
RUN npm ci --only=development

# Copy source code
COPY . .

# Change ownership to non-root user
RUN chown -R vanitya:nodejs /app
USER vanitya

# Expose port
EXPOSE 3000

# Start the application with nodemon for development
CMD ["dumb-init", "npm", "run", "dev"]

# Production dependencies stage
FROM base AS production-deps
ENV NODE_ENV=production

# Install only production dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Production stage
FROM base AS production
ENV NODE_ENV=production

# Copy production dependencies
COPY --from=production-deps --chown=vanitya:nodejs /app/node_modules ./node_modules

# Copy source code
COPY --chown=vanitya:nodejs . .

# Remove unnecessary files
RUN rm -rf src/test && \
    rm -rf docs && \
    rm -rf .git

# Change to non-root user
USER vanitya

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["dumb-init", "node", "server.js"]

# Default to production stage
FROM production