#!/bin/sh
# Entrypoint script to initialize database and run CLI
set -e

echo "🔧 Teams CLI - Production Entrypoint"
echo "📦 Environment: ${NODE_ENV:-production}"
echo "💾 Database: ${DATABASE_URL:-file:/app/.teams-cli/teams.db}"

# Ensure database directory exists
mkdir -p /app/.teams-cli

# Run CLI command
exec node dist/index.js "$@"
