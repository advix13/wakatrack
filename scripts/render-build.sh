#!/usr/bin/env bash
# Exit on error
set -e

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Create data directory if it doesn't exist
mkdir -p /var/data

# Set correct permissions
chmod 777 /var/data

# Run database migrations
DATABASE_URL="file:/var/data/sqlite.db" npx prisma migrate deploy

# Build the application
npm run build
