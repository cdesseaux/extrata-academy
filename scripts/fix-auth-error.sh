#!/bin/bash

echo "🔧 Corrigindo erro 400 de autenticação..."
echo "========================================"

# Limpar cache do Next.js
echo "1️⃣ Limpando cache do Next.js..."
cd frontend
rm -rf .next
rm -rf node_modules/.cache
echo "✅ Cache limpo"

# Limpar localStorage do navegador (instruções)
echo ""
echo "2️⃣ Limpe o localStorage do navegador:"
echo "   - Abra o DevTools (F12)"
echo "   - Vá em Application > Storage > Local Storage"
echo "   - Delete todas as chaves relacionadas ao Keycloak"
echo "   - Ou execute no console: localStorage.clear()"

# Verificar variáveis de ambiente
echo ""
echo "3️⃣ Verificando variáveis de ambiente..."
if [ -f ".env" ]; then
    echo "✅ Arquivo .env encontrado"
    if grep -q "NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=academy-frontend" .env; then
        echo "✅ Client ID configurado corretamente"
    else
        echo "⚠️ Client ID pode estar incorreto"
        echo "💡 Verifique se NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=academy-frontend"
    fi
else
    echo "⚠️ Arquivo .env não encontrado"
    echo "💡 Crie um arquivo .env baseado no env.example"
fi

# Instalar dependências
echo ""
echo "4️⃣ Reinstalando dependências..."
npm install
echo "✅ Dependências instaladas"

# Testar configuração do Keycloak
echo ""
echo "5️⃣ Testando configuração do Keycloak..."
node ../test-keycloak-config.js

echo ""
echo "🚀 Próximos passos:"
echo "1. Configure o client 'academy-frontend' no Keycloak Admin"
echo "2. Adicione as Valid Redirect URIs: http://localhost:3000/*"
echo "3. Reinicie o frontend: npm run dev"
echo "4. Teste a autenticação"
echo ""
echo "🔗 Keycloak Admin: https://keycloak-hlg.extrata.com.br/admin"
echo "📁 Realm: extrata"
