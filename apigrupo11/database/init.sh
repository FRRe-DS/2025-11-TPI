#!/bin/bash
# filepath: /Users/tomaskobluk/2025-11-TPI/apigrupo11/backend/database/init.sh

# Database initialization script for PostgreSQL
# This script sets up the database and runs the schema

set -e

# Default values (can be overridden with environment variables)
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-stock_management}
DB_USER=${DB_USER:-postgres}
DB_PASSWORD=${DB_PASSWORD:-password}

echo "🔧 Initializing PostgreSQL database..."

# Check if PostgreSQL is running
if ! pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" > /dev/null 2>&1; then
    echo "❌ PostgreSQL is not running on $DB_HOST:$DB_PORT"
    echo "Please start PostgreSQL first:"
    echo "  brew services start postgresql@14  # macOS with Homebrew"
    echo "  sudo systemctl start postgresql    # Linux"
    echo "  or start your PostgreSQL Docker container"
    exit 1
fi

echo "✅ PostgreSQL is running"

# Create database if it doesn't exist
echo "📦 Creating database '$DB_NAME' if it doesn't exist..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || \
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -c "CREATE DATABASE $DB_NAME;"

echo "✅ Database '$DB_NAME' is ready"

# Run schema
echo "🗂️  Running database schema..."
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$(dirname "$0")/schema.sql"

echo "✅ Database schema applied successfully"
echo "🎉 Database initialization complete!"

echo ""
echo "📝 Connection details:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo ""
echo "🔗 Connection string: postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"
