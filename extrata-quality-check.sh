#!/bin/bash

# ============================================
# EXTRATA ACADEMY - Code Quality Check
# ============================================
# This script runs all quality checks before commit/push
# Run: chmod +x check-quality.sh && ./check-quality.sh
# ============================================

set -e

# Colors
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

# Counters
ERRORS=0
WARNINGS=0

# ============================================
# CHECK 1: Git Status
# ============================================
print_header "CHECK 1: Git Status"

if ! git diff-index --quiet HEAD --; then
    print_success "Uncommitted changes detected"
else
    print_warning "No changes detected"
fi

BRANCH=$(git branch --show-current)
print_info "Current branch: $BRANCH"

echo ""

# ============================================
# CHECK 2: Backend Linting
# ============================================
print_header "CHECK 2: Backend Linting"

if [ -d "backend" ]; then
    cd backend
    
    if [ -f "package.json" ]; then
        print_info "Running ESLint..."
        if npm run lint > /dev/null 2>&1; then
            print_success "Backend linting passed"
        else
            print_error "Backend linting failed"
            ERRORS=$((ERRORS + 1))
        fi
    else
        print_warning "Backend package.json not found, skipping..."
    fi
    
    cd ..
else
    print_warning "Backend directory not found, skipping..."
fi

echo ""

# ============================================
# CHECK 3: Backend Tests
# ============================================
print_header "CHECK 3: Backend Tests"

if [ -d "backend" ]; then
    cd backend
    
    if [ -f "package.json" ]; then
        print_info "Running backend tests..."
        if npm run test -- --passWithNoTests > /dev/null 2>&1; then
            print_success "Backend tests passed"
        else
            print_error "Backend tests failed"
            ERRORS=$((ERRORS + 1))
        fi
        
        # Coverage check
        print_info "Checking test coverage..."
        if npm run test:cov > /dev/null 2>&1; then
            COVERAGE=$(cat coverage/coverage-summary.json | grep -o '"total":{[^}]*}' | grep -o '"lines":{[^}]*}' | grep -o '"pct":[0-9.]*' | grep -o '[0-9.]*')
            if (( $(echo "$COVERAGE >= 80" | bc -l) )); then
                print_success "Coverage: $COVERAGE% (≥80%)"
            else
                print_warning "Coverage: $COVERAGE% (<80%)"
                WARNINGS=$((WARNINGS + 1))
            fi
        fi
    fi
    
    cd ..
fi

echo ""

# ============================================
# CHECK 4: Frontend Linting
# ============================================
print_header "CHECK 4: Frontend Linting"

if [ -d "frontend" ]; then
    cd frontend
    
    if [ -f "package.json" ]; then
        print_info "Running ESLint..."
        if npm run lint > /dev/null 2>&1; then
            print_success "Frontend linting passed"
        else
            print_error "Frontend linting failed"
            ERRORS=$((ERRORS + 1))
        fi
    else
        print_warning "Frontend package.json not found, skipping..."
    fi
    
    cd ..
else
    print_warning "Frontend directory not found, skipping..."
fi

echo ""

# ============================================
# CHECK 5: Frontend Tests
# ============================================
print_header "CHECK 5: Frontend Tests"

if [ -d "frontend" ]; then
    cd frontend
    
    if [ -f "package.json" ]; then
        print_info "Running frontend tests..."
        if npm run test -- --passWithNoTests > /dev/null 2>&1; then
            print_success "Frontend tests passed"
        else
            print_error "Frontend tests failed"
            ERRORS=$((ERRORS + 1))
        fi
    fi
    
    cd ..
fi

echo ""

# ============================================
# CHECK 6: TypeScript Compilation
# ============================================
print_header "CHECK 6: TypeScript Compilation"

# Backend
if [ -d "backend" ]; then
    cd backend
    
    if [ -f "tsconfig.json" ]; then
        print_info "Checking backend TypeScript..."
        if npx tsc --noEmit > /dev/null 2>&1; then
            print_success "Backend TypeScript check passed"
        else
            print_error "Backend TypeScript check failed"
            ERRORS=$((ERRORS + 1))
        fi
    fi
    
    cd ..
fi

# Frontend
if [ -d "frontend" ]; then
    cd frontend
    
    if [ -f "tsconfig.json" ]; then
        print_info "Checking frontend TypeScript..."
        if npx tsc --noEmit > /dev/null 2>&1; then
            print_success "Frontend TypeScript check passed"
        else
            print_error "Frontend TypeScript check failed"
            ERRORS=$((ERRORS + 1))
        fi
    fi
    
    cd ..
fi

echo ""

# ============================================
# CHECK 7: Security Audit
# ============================================
print_header "CHECK 7: Security Audit"

# Backend
if [ -d "backend" ]; then
    cd backend
    
    if [ -f "package.json" ]; then
        print_info "Running npm audit (backend)..."
        BACKEND_AUDIT=$(npm audit --audit-level=high 2>&1)
        if [ $? -eq 0 ]; then
            print_success "No high severity vulnerabilities found (backend)"
        else
            print_warning "Security vulnerabilities found (backend)"
            WARNINGS=$((WARNINGS + 1))
        fi
    fi
    
    cd ..
fi

# Frontend
if [ -d "frontend" ]; then
    cd frontend
    
    if [ -f "package.json" ]; then
        print_info "Running npm audit (frontend)..."
        FRONTEND_AUDIT=$(npm audit --audit-level=high 2>&1)
        if [ $? -eq 0 ]; then
            print_success "No high severity vulnerabilities found (frontend)"
        else
            print_warning "Security vulnerabilities found (frontend)"
            WARNINGS=$((WARNINGS + 1))
        fi
    fi
    
    cd ..
fi

echo ""

# ============================================
# CHECK 8: Docker Validation
# ============================================
print_header "CHECK 8: Docker Validation"

if [ -f "docker-compose.yml" ]; then
    print_info "Validating docker-compose.yml..."
    if docker-compose config > /dev/null 2>&1; then
        print_success "docker-compose.yml is valid"
    else
        print_error "docker-compose.yml has errors"
        ERRORS=$((ERRORS + 1))
    fi
else
    print_warning "docker-compose.yml not found, skipping..."
fi

echo ""

# ============================================
# CHECK 9: Environment Variables
# ============================================
print_header "CHECK 9: Environment Variables"

if [ -f ".env.example" ]; then
    print_success ".env.example exists"
    
    if [ -f ".env" ]; then
        print_success ".env exists"
        
        # Check if all variables from .env.example are in .env
        MISSING_VARS=()
        while IFS= read -r line; do
            # Skip comments and empty lines
            [[ "$line" =~ ^#.*$ ]] && continue
            [[ -z "$line" ]] && continue
            
            # Extract variable name
            VAR_NAME=$(echo "$line" | cut -d'=' -f1)
            
            # Check if exists in .env
            if ! grep -q "^$VAR_NAME=" .env; then
                MISSING_VARS+=("$VAR_NAME")
            fi
        done < .env.example
        
        if [ ${#MISSING_VARS[@]} -eq 0 ]; then
            print_success "All variables from .env.example are in .env"
        else
            print_warning "Missing variables in .env: ${MISSING_VARS[*]}"
            WARNINGS=$((WARNINGS + 1))
        fi
    else
        print_warning ".env not found (create from .env.example)"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    print_warning ".env.example not found"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""

# ============================================
# CHECK 10: Documentation
# ============================================
print_header "CHECK 10: Documentation"

REQUIRED_DOCS=(
    "README.md"
    "CONTRIBUTING.md"
    "docs/07-DEVELOPMENT-GUIDE.md"
)

for doc in "${REQUIRED_DOCS[@]}"; do
    if [ -f "$doc" ]; then
        print_success "$doc exists"
    else
        print_warning "$doc not found"
        WARNINGS=$((WARNINGS + 1))
    fi
done

echo ""

# ============================================
# CHECK 11: Code Style
# ============================================
print_header "CHECK 11: Code Style (Prettier)"

# Backend
if [ -d "backend" ]; then
    cd backend
    
    if [ -f ".prettierrc" ] || [ -f "prettier.config.js" ]; then
        print_info "Checking backend code formatting..."
        if npx prettier --check "src/**/*.ts" > /dev/null 2>&1; then
            print_success "Backend code is properly formatted"
        else
            print_warning "Backend code needs formatting (run: npm run format)"
            WARNINGS=$((WARNINGS + 1))
        fi
    fi
    
    cd ..
fi

# Frontend
if [ -d "frontend" ]; then
    cd frontend
    
    if [ -f ".prettierrc" ] || [ -f "prettier.config.js" ]; then
        print_info "Checking frontend code formatting..."
        if npx prettier --check "src/**/*.{ts,tsx}" > /dev/null 2>&1; then
            print_success "Frontend code is properly formatted"
        else
            print_warning "Frontend code needs formatting (run: npm run format)"
            WARNINGS=$((WARNINGS + 1))
        fi
    fi
    
    cd ..
fi

echo ""

# ============================================
# CHECK 12: Commit Message
# ============================================
print_header "CHECK 12: Last Commit Message"

LAST_COMMIT=$(git log -1 --pretty=%B)
print_info "Last commit: $LAST_COMMIT"

# Check if follows conventional commits
if [[ $LAST_COMMIT =~ ^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?: ]]; then
    print_success "Commit message follows Conventional Commits"
else
    print_warning "Commit message should follow Conventional Commits format"
    print_info "Example: feat(courses): add video player"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""

# ============================================
# FINAL REPORT
# ============================================
print_header "QUALITY CHECK SUMMARY"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    print_success "All checks passed! 🎉"
    print_success "Code is ready to commit/push"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    print_warning "Checks passed with $WARNINGS warning(s)"
    print_info "Consider fixing warnings before pushing"
    exit 0
else
    print_error "Checks failed with $ERRORS error(s) and $WARNINGS warning(s)"
    print_error "Please fix errors before committing"
    exit 1
fi
