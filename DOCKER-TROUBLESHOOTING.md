# Docker Troubleshooting Guide

## Issue: Database Connection Refused (localhost:5432)

The migration script cannot connect to PostgreSQL even though you say Docker is running.

## Step-by-Step Diagnosis

### 1. Check if Docker is Running

```bash
docker --version
docker ps
```

**Expected**: Should show running containers including `extrata-academy-postgres`

**If not**: Docker daemon might not be running.
```bash
# macOS/Windows: Start Docker Desktop
# Linux: sudo systemctl start docker
```

---

### 2. Check Container Status

```bash
docker compose ps
```

**Expected Output**:
```
NAME                          IMAGE                 STATUS
extrata-academy-backend       ...                   Up
extrata-academy-postgres      postgres:17-alpine    Up (healthy)
extrata-academy-redis         redis:7-alpine        Up (healthy)
...
```

**If containers are not running**:
```bash
# Start all services
docker compose up -d

# Or start specific services
docker compose up -d postgres redis
```

---

### 3. Check PostgreSQL Container Logs

```bash
docker compose logs postgres
```

**Look for**:
- ✅ `database system is ready to accept connections`
- ❌ Errors like `FATAL: password authentication failed`
- ❌ `port 5432 already in use`

**Common Issues**:

#### Issue: Port 5432 already in use
```bash
# Check what's using port 5432
sudo lsof -i :5432
# or
sudo netstat -tlnp | grep 5432

# If another PostgreSQL is running, stop it
sudo systemctl stop postgresql
# or kill the process
```

#### Issue: Container keeps restarting
```bash
# Check detailed logs
docker compose logs --tail=100 postgres

# Check container health
docker inspect extrata-academy-postgres | grep -A 10 Health
```

---

### 4. Test Database Connection

```bash
# From host machine
docker compose exec postgres pg_isready -U academy

# Connect to PostgreSQL
docker compose exec postgres psql -U academy -d academy

# If successful, you should see:
# academy=#

# Test query
academy=# SELECT 1;
academy=# \dt  # List tables
academy=# \q   # Quit
```

**If connection fails**:
```bash
# Check environment variables
docker compose exec postgres env | grep POSTGRES

# Should show:
# POSTGRES_USER=academy
# POSTGRES_PASSWORD=academy123
# POSTGRES_DB=academy
```

---

### 5. Check Port Mapping

```bash
# Check if port 5432 is exposed
docker compose port postgres 5432

# Expected: 0.0.0.0:5432
```

**Test connection from host**:
```bash
# Install PostgreSQL client if not installed
# macOS: brew install postgresql@17
# Ubuntu: sudo apt-get install postgresql-client
# Windows: Install from https://www.postgresql.org/download/windows/

# Test connection
psql -h localhost -p 5432 -U academy -d academy
# Password: academy123
```

---

### 6. Check Docker Network

```bash
# List Docker networks
docker network ls

# Inspect academy network
docker network inspect academy-network

# Check if containers are connected
docker compose exec backend ping postgres -c 3
```

---

### 7. Restart Services

Sometimes a fresh start helps:

```bash
# Stop all services
docker compose down

# Remove volumes (WARNING: This deletes data!)
docker compose down -v

# Start fresh
docker compose up -d

# Wait for health checks
docker compose ps

# Check logs
docker compose logs -f postgres
```

---

### 8. Verify Migration Script Connection

The migration script uses these credentials from `backend/src/database/data-source.ts`:

```typescript
host: process.env.DB_HOST || 'localhost',
port: parseInt(process.env.DB_PORT || '5432'),
username: process.env.DB_USERNAME || 'academy',
password: process.env.DB_PASSWORD || 'academy123',
database: process.env.DB_DATABASE || 'academy',
```

**Test with environment variables**:
```bash
export DB_HOST=localhost
export DB_PORT=5432
export DB_USERNAME=academy
export DB_PASSWORD=academy123
export DB_DATABASE=academy

cd backend
npm run migration:run
```

**Or create `.env` file in `backend/` directory**:
```bash
# backend/.env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=academy
DB_PASSWORD=academy123
DB_DATABASE=academy
```

---

### 9. Check Docker Compose File

Verify `docker-compose.yml` has correct port mapping:

```yaml
services:
  postgres:
    image: postgres:17-alpine
    ports:
      - "${DB_PORT:-5432}:5432"  # Should map to localhost:5432
    environment:
      POSTGRES_DB: ${DB_NAME:-academy}
      POSTGRES_USER: ${DB_USER:-academy}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-academy123}
```

---

### 10. Alternative: Run Migration Inside Container

If localhost connection doesn't work, run migration inside the backend container:

```bash
# Enter backend container
docker compose exec backend bash

# Inside container, run migration
npm run migration:run

# Exit container
exit
```

**Why this works**: Inside the container, `DB_HOST=postgres` (service name) instead of `localhost`.

---

## Quick Fix Summary

### Most Common Solution:

```bash
# 1. Ensure containers are running
docker compose up -d postgres redis

# 2. Wait for healthy status
docker compose ps

# 3. Test connection
docker compose exec postgres psql -U academy -d academy -c "SELECT 1;"

# 4. Run migration
cd backend
npm run migration:run

# If that fails, run inside container:
docker compose exec backend npm run migration:run
```

---

## Still Not Working?

### Get Full Diagnostic Info:

```bash
# Save diagnostic info to file
{
  echo "=== Docker Version ==="
  docker --version
  docker compose version

  echo -e "\n=== Container Status ==="
  docker compose ps

  echo -e "\n=== PostgreSQL Logs ==="
  docker compose logs --tail=50 postgres

  echo -e "\n=== Port Check ==="
  docker compose port postgres 5432
  netstat -an | grep 5432 || ss -tlnp | grep 5432

  echo -e "\n=== Network Info ==="
  docker network inspect academy-network | grep -A 5 "extrata-academy-postgres"

  echo -e "\n=== Environment Check ==="
  docker compose exec postgres env | grep POSTGRES

} > docker-diagnostic.txt

cat docker-diagnostic.txt
```

Then share `docker-diagnostic.txt` for further assistance.

---

## Next Steps After Docker is Fixed

Once Docker is working and database is accessible:

```bash
# 1. Run migrations
cd backend
npm run migration:run

# 2. Verify indexes were created
docker compose exec postgres psql -U academy -d academy

academy=# \di  # List all indexes
academy=# SELECT indexname FROM pg_indexes WHERE schemaname = 'public' ORDER BY indexname;

# 3. Test query performance
academy=# EXPLAIN ANALYZE SELECT * FROM user_xp ORDER BY "totalXP" DESC LIMIT 10;

# 4. Start backend
docker compose up -d backend

# 5. Run smoke test
k6 run tests/load/smoke-test.js
```

---

## Environment-Specific Notes

### GitHub Migration
You mentioned you recently migrated to GitHub. If containers are running from old code:

```bash
# Pull latest code
git pull origin main

# Rebuild containers to use new code
docker compose down
docker compose build --no-cache
docker compose up -d

# Check logs
docker compose logs -f backend
```

### Local vs. Container Files
- **Migration runs on HOST**: Connects to localhost:5432
- **Backend runs in CONTAINER**: Connects to postgres:5432 (Docker service name)

Make sure your local files match what's in the containers after migration!

```bash
# Verify local files are up-to-date
git status
git log -1

# Verify container files (if mounted)
docker compose exec backend ls -la /app
docker compose exec backend cat /app/package.json | grep version
```
