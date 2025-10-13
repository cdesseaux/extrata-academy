#!/bin/bash

# ============================================
# EXTRATA ACADEMY - Development Setup Script
# ============================================
# This script sets up the complete development environment
# Run: chmod +x setup-dev.sh && ./setup-dev.sh
# ============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}============================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}============================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

check_command() {
    if ! command -v $1 &> /dev/null; then
        print_error "$1 is not installed. Please install it first."
        exit 1
    fi
}

# ============================================
# STEP 0: Prerequisites Check
# ============================================
print_header "STEP 0: Checking Prerequisites"

check_command "node"
check_command "npm"
check_command "docker"
check_command "docker-compose"
check_command "git"

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    print_error "Node.js version must be 20 or higher. Current: $(node -v)"
    exit 1
fi

print_success "All prerequisites met!"
print_info "Node: $(node -v)"
print_info "npm: $(npm -v)"
print_info "Docker: $(docker --version)"
print_info "Docker Compose: $(docker-compose --version)"

# ============================================
# STEP 1: Project Structure
# ============================================
print_header "STEP 1: Creating Project Structure"

# Create main directories
mkdir -p backend frontend shared docs infrastructure scripts .github/workflows

# Create subdirectories
mkdir -p docs/assets/{diagrams,wireframes,screenshots}
mkdir -p infrastructure/{docker,kubernetes,terraform}
mkdir -p scripts

print_success "Project structure created"

# ============================================
# STEP 2: Environment Variables
# ============================================
print_header "STEP 2: Setting up Environment Variables"

if [ ! -f .env ]; then
    print_info "Creating .env from .env.example..."
    cp .env.example .env
    
    # Generate random secrets
    JWT_SECRET=$(openssl rand -hex 32)
    REDIS_PASSWORD=$(openssl rand -hex 16)
    
    # Update .env with generated secrets
    sed -i.bak "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
    sed -i.bak "s/REDIS_PASSWORD=.*/REDIS_PASSWORD=$REDIS_PASSWORD/" .env
    rm .env.bak
    
    print_success ".env created with random secrets"
    print_warning "Please update .env with your specific configuration"
else
    print_warning ".env already exists, skipping..."
fi

# ============================================
# STEP 3: Initialize Backend
# ============================================
print_header "STEP 3: Initializing Backend (NestJS)"

if [ ! -f backend/package.json ]; then
    print_info "Creating NestJS project..."
    cd backend
    npx @nestjs/cli new . --strict --package-manager npm --skip-git
    
    # Install additional dependencies
    print_info "Installing backend dependencies..."
    npm install --save \
        @nestjs/config \
        @nestjs/typeorm typeorm pg \
        @nestjs/passport passport passport-jwt @nestjs/jwt \
        @nestjs/swagger swagger-ui-express \
        class-validator class-transformer \
        bcrypt \
        redis ioredis @nestjs/cache-manager cache-manager \
        @aws-sdk/client-s3 \
        pdfkit \
        qrcode
    
    npm install --save-dev \
        @types/passport-jwt \
        @types/bcrypt \
        @types/pdfkit \
        @types/qrcode
    
    cd ..
    print_success "Backend initialized"
else
    print_warning "Backend already exists, skipping..."
fi

# ============================================
# STEP 4: Initialize Frontend
# ============================================
print_header "STEP 4: Initializing Frontend (Next.js)"

if [ ! -f frontend/package.json ]; then
    print_info "Creating Next.js project..."
    npx create-next-app@latest frontend \
        --typescript \
        --tailwind \
        --app \
        --src-dir \
        --import-alias "@/*" \
        --no-git
    
    cd frontend
    
    # Install additional dependencies
    print_info "Installing frontend dependencies..."
    npm install \
        @tanstack/react-query \
        zustand \
        axios \
        zod react-hook-form @hookform/resolvers \
        lucide-react \
        clsx tailwind-merge \
        next-themes
    
    npm install --save-dev \
        @types/node
    
    # Setup shadcn/ui
    print_info "Setting up shadcn/ui..."
    npx shadcn-ui@latest init -y
    npx shadcn-ui@latest add button card input label select badge avatar skeleton
    
    cd ..
    print_success "Frontend initialized"
else
    print_warning "Frontend already exists, skipping..."
fi

# ============================================
# STEP 5: Docker Infrastructure
# ============================================
print_header "STEP 5: Starting Docker Infrastructure"

print_info "Starting PostgreSQL, Redis, and Keycloak..."
docker-compose up -d postgres redis keycloak

print_info "Waiting for services to be healthy..."
sleep 10

# Wait for PostgreSQL
print_info "Waiting for PostgreSQL..."
until docker exec extrata-academy-postgres pg_isready -U academy > /dev/null 2>&1; do
    echo -n "."
    sleep 1
done
print_success "PostgreSQL is ready"

# Wait for Redis
print_info "Waiting for Redis..."
until docker exec extrata-academy-redis redis-cli ping > /dev/null 2>&1; do
    echo -n "."
    sleep 1
done
print_success "Redis is ready"

# Wait for Keycloak
print_info "Waiting for Keycloak (this may take a minute)..."
sleep 20
until curl -s http://localhost:8080 > /dev/null 2>&1; do
    echo -n "."
    sleep 2
done
print_success "Keycloak is ready"

# ============================================
# STEP 6: Database Setup
# ============================================
print_header "STEP 6: Setting up Database"

# Create initial database if needed
docker exec extrata-academy-postgres psql -U academy -d academy -c "SELECT 1;" > /dev/null 2>&1 || \
docker exec extrata-academy-postgres psql -U academy -c "CREATE DATABASE academy;"

print_success "Database ready"

# ============================================
# STEP 7: Git Setup
# ============================================
print_header "STEP 7: Git Setup"

if [ ! -d .git ]; then
    print_info "Initializing git repository..."
    git init
    
    # Create .gitignore
    cat > .gitignore <<EOF
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/
*.lcov

# Next.js
.next/
out/
build/

# Production
dist/

# Environment
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# Docker
docker-compose.override.yml

# Logs
logs/
*.log
EOF
    
    git add .
    git commit -m "chore: initial setup"
    
    print_success "Git repository initialized"
else
    print_warning "Git already initialized, skipping..."
fi

# ============================================
# STEP 8: Final Instructions
# ============================================
print_header "SETUP COMPLETE! 🎉"

echo ""
print_success "Your Extrata Academy development environment is ready!"
echo ""
print_info "Next steps:"
echo ""
echo "1. Review and update .env file with your configuration"
echo "2. Start the backend:"
echo "   $ cd backend && npm run start:dev"
echo ""
echo "3. In a new terminal, start the frontend:"
echo "   $ cd frontend && npm run dev"
echo ""
echo "4. Access your applications:"
echo "   - Frontend:  http://localhost:3000"
echo "   - Backend:   http://localhost:4000"
echo "   - Swagger:   http://localhost:4000/api/docs"
echo "   - Keycloak:  http://localhost:8080"
echo "   - Adminer:   http://localhost:8081 (run: docker-compose --profile tools up adminer)"
echo ""
echo "5. Default credentials:"
echo "   - Keycloak Admin: admin / admin"
echo "   - Database: academy / academy123"
echo "   - Redis: redis123"
echo ""
print_info "For more information, check docs/07-DEVELOPMENT-GUIDE.md"
echo ""
print_warning "Don't forget to configure Keycloak with your realm and clients!"
echo ""

# ============================================
# Optional: Open browser
# ============================================
read -p "Open browser tabs? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    sleep 2
    open http://localhost:3000 2>/dev/null || xdg-open http://localhost:3000 2>/dev/null || echo "Please open http://localhost:3000 manually"
    open http://localhost:4000/api/docs 2>/dev/null || xdg-open http://localhost:4000/api/docs 2>/dev/null
    open http://localhost:8080 2>/dev/null || xdg-open http://localhost:8080 2>/dev/null
fi

print_success "Happy coding! 🚀"
