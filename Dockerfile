# Use official Node.js 20 Alpine image for smaller size
FROM node:20-alpine

# Install bash for better shell support
RUN apk add --no-cache bash

# Create app directory
WORKDIR /app

# Create directory for SQLite database
RUN mkdir -p /app/.teams-cli

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for building)
RUN npm ci && npm cache clean --force

# Copy drizzle config and migrations
COPY drizzle ./drizzle
COPY drizzle.config.ts ./
COPY docker-entrypoint.sh ./

# Make entrypoint executable
RUN chmod +x ./docker-entrypoint.sh

# Copy source code
COPY . .

# Build the TypeScript code
RUN npm run build

# Remove dev dependencies after build
RUN npm prune --production

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S teamscli -u 1001

# Change ownership of the app directory and database directory
RUN chown -R teamscli:nodejs /app
USER teamscli

# Set environment variables
ENV NODE_ENV=production
ENV DATABASE_URL=file:/app/.teams-cli/teams.db

# Expose port for API server (if used)
EXPOSE 3000

# Default command - run entrypoint script (can be overridden with arguments)
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["--help"]
