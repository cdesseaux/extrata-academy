#!/bin/bash

echo "🚀 Extrata Academy - Testes Automatizados"
echo "=========================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
log() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERRO]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCESSO]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[AVISO]${NC} $1"
}

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    error "Node.js não encontrado. Instale Node.js primeiro."
    exit 1
fi

# Verificar se npm está instalado
if ! command -v npm &> /dev/null; then
    error "npm não encontrado. Instale npm primeiro."
    exit 1
fi

log "Verificando dependências..."

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    log "Instalando dependências do Playwright..."
    npm install
    if [ $? -ne 0 ]; then
        error "Falha ao instalar dependências"
        exit 1
    fi
    success "Dependências instaladas"
else
    success "Dependências já instaladas"
fi

# Instalar browsers do Playwright
log "Instalando browsers do Playwright..."
npx playwright install
if [ $? -ne 0 ]; then
    error "Falha ao instalar browsers"
    exit 1
fi
success "Browsers instalados"

# Verificar se os serviços estão rodando
log "Verificando serviços..."

# Verificar frontend
if curl -s http://localhost:3000 > /dev/null; then
    success "Frontend rodando em localhost:3000"
else
    warning "Frontend não está rodando em localhost:3000"
fi

# Verificar backend
if curl -s http://localhost:4000/api > /dev/null; then
    success "Backend rodando em localhost:4000"
else
    warning "Backend não está rodando em localhost:4000"
fi

# Executar testes
log "Iniciando testes automatizados..."
echo ""

# Executar todos os testes
npx playwright test --reporter=html,json,junit

# Verificar resultado
if [ $? -eq 0 ]; then
    success "Todos os testes passaram!"
else
    error "Alguns testes falharam"
fi

# Mostrar relatório
log "Abrindo relatório HTML..."
npx playwright show-report

echo ""
echo "🎉 Testes concluídos!"
echo "📊 Relatórios gerados:"
echo "   - HTML: playwright-report/index.html"
echo "   - JSON: test-results.json"
echo "   - JUnit: test-results.xml"


