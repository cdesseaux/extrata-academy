#!/bin/bash

echo "=========================================="
echo "Testando autenticação do backend"
echo "=========================================="
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verifica se o backend está rodando
echo "1. Verificando se o backend está rodando..."
if curl -s http://localhost:4000/api/health > /dev/null; then
    echo -e "${GREEN}✓ Backend está rodando${NC}"
else
    echo -e "${RED}✗ Backend não está respondendo${NC}"
    exit 1
fi

echo ""
echo "2. Verificando configuração do Keycloak..."
curl -s http://localhost:4000/api/auth/env-debug | jq '.'

echo ""
echo "3. Para testar com um token do Keycloak, use:"
echo -e "${YELLOW}curl -H 'Authorization: Bearer SEU_TOKEN_AQUI' http://localhost:4000/api/auth/verify${NC}"

echo ""
echo "4. Para debugar o token, use:"
echo -e "${YELLOW}curl -H 'Authorization: Bearer SEU_TOKEN_AQUI' http://localhost:4000/api/auth/test-token${NC}"

echo ""
echo "=========================================="
echo "Endpoints disponíveis:"
echo "=========================================="
echo "GET  /api/health              - Health check"
echo "GET  /api/auth/env-debug      - Debug de variáveis de ambiente"
echo "GET  /api/auth/debug          - Debug do token (sem validação)"
echo "GET  /api/auth/test-token     - Testa validação do token"
echo "GET  /api/auth/profile        - Perfil do usuário (requer autenticação)"
echo "GET  /api/auth/verify         - Verifica token (requer autenticação)"
echo ""
