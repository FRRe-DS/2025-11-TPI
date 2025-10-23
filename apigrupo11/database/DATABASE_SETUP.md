# PostgreSQL Database Setup

This document explains how to set up and use PostgreSQL with this project.

## Quick Start with Docker

The easiest way to set up PostgreSQL for development is using Docker Compose:

```bash
# Navigate to the database directory
cd database

# Start PostgreSQL and Adminer (web interface)
docker-compose up -d

# Check if containers are running
docker-compose ps
```

This will:
- Start PostgreSQL on port 5432 with the database `stock_management`
- Start Adminer (web interface) on http://localhost:8080
- Automatically create the database schema

### Adminer Access
- URL: http://localhost:8080
- System: PostgreSQL
- Server: postgres
- Username: postgres
- Password: password
- Database: stock_management

## Manual Setup

### 1. Install PostgreSQL

**macOS (with Homebrew):**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Download and install from https://www.postgresql.org/download/windows/

### 2. Create Database and User

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE stock_management;

# (Optional) Create specific user
CREATE USER stock_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE stock_management TO stock_user;

\q
```

### 3. Run Database Schema

```bash
# Navigate to the backend directory
cd backend

# Run the initialization script
./database/init.sh

# Or manually run the schema
psql -U postgres -d stock_management -f database/schema.sql
```

## Environment Configuration

Update your `.env.local` file in the backend directory:

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=stock_management
DB_USER=postgres
DB_PASSWORD=password

# ... other configuration
```

## Database Schema

The database includes the following main tables:

- **productos**: Store product information
- **categorias**: Product categories
- **producto_categorias**: Many-to-many relationship between products and categories
- **reservas**: Order reservations
- **reserva_productos**: Products within reservations

### Key Features

- **JSONB Support**: Uses PostgreSQL's JSONB for flexible data like dimensions, location, and images
- **Indexes**: Optimized for common queries
- **Triggers**: Automatic timestamp updates
- **View**: `productos_con_categorias` for easy querying with joined categories

## API Endpoints

Once the database is set up, the following endpoints will work with PostgreSQL:

- `GET /api/productos` - List products with filtering and pagination
- `POST /api/productos` - Create new product
- `GET /api/productos/{id}` - Get specific product
- `PATCH /api/productos/{id}` - Update product
- `DELETE /api/productos/{id}` - Delete product

## Development Commands

```bash
# Start the backend with database
cd backend
npm run dev

# Test database connection
curl http://localhost:3000/api/productos

# Create a test product
curl -X POST http://localhost:3000/api/productos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "nombre": "Test Product",
    "precio": 99.99,
    "stockInicial": 10,
    "descripcion": "A test product"
  }'
```

## Troubleshooting

### Connection Errors

1. **PostgreSQL not running:**
   ```bash
   # Check if PostgreSQL is running
   brew services list | grep postgresql  # macOS
   sudo systemctl status postgresql      # Linux
   ```

2. **Wrong credentials:**
   - Verify DB_USER and DB_PASSWORD in .env.local
   - Check if user exists: `psql -U postgres -c "\du"`

3. **Database doesn't exist:**
   ```bash
   psql -U postgres -c "CREATE DATABASE stock_management;"
   ```

### Performance Issues

1. **Enable query logging** (in postgresql.conf):
   ```
   log_statement = 'all'
   log_duration = on
   ```

2. **Check slow queries:**
   ```sql
   -- Enable slow query logging
   ALTER DATABASE stock_management SET log_min_duration_statement = 1000;
   ```

## Migration from In-Memory Database

The in-memory database (`src/lib/db.ts`) has been replaced with PostgreSQL. The old implementation is kept for reference but no longer used in the API routes.

Key changes:
- All producto operations now use `productoDB` from `@/lib/database`
- Async/await pattern for database operations
- Proper error handling and logging
- JSONB for complex data structures

## Backup and Restore

```bash
# Create backup
pg_dump -U postgres stock_management > backup.sql

# Restore backup
psql -U postgres -d stock_management < backup.sql
```
