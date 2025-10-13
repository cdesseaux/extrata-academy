# Script PowerShell para corrigir erro 400 de autenticação
# Compatível com Windows PowerShell

Write-Host "🔧 Corrigindo erro 400 de autenticação..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# Limpar cache do Next.js
Write-Host "`n1️⃣ Limpando cache do Next.js..." -ForegroundColor Yellow
Set-Location frontend
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue
Write-Host "✅ Cache limpo" -ForegroundColor Green

# Verificar variáveis de ambiente
Write-Host "`n2️⃣ Verificando variáveis de ambiente..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "✅ Arquivo .env encontrado" -ForegroundColor Green
    $envContent = Get-Content .env -Raw
    if ($envContent -match "NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=academy-frontend") {
        Write-Host "✅ Client ID configurado corretamente" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Client ID pode estar incorreto" -ForegroundColor Yellow
        Write-Host "💡 Verifique se NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=academy-frontend" -ForegroundColor Cyan
    }
} else {
    Write-Host "⚠️ Arquivo .env não encontrado" -ForegroundColor Yellow
    Write-Host "💡 Crie um arquivo .env baseado no env.example" -ForegroundColor Cyan
}

# Instalar dependências
Write-Host "`n3️⃣ Reinstalando dependências..." -ForegroundColor Yellow
npm install
Write-Host "✅ Dependências instaladas" -ForegroundColor Green

# Testar configuração do Keycloak
Write-Host "`n4️⃣ Testando configuração do Keycloak..." -ForegroundColor Yellow
Set-Location ..
node scripts/configure-keycloak-client.js

Write-Host "`n🚀 Próximos passos:" -ForegroundColor Green
Write-Host "1. Configure o client 'academy-frontend' no Keycloak Admin" -ForegroundColor White
Write-Host "2. Adicione as Valid Redirect URIs: http://localhost:3000/*" -ForegroundColor White
Write-Host "3. Reinicie o frontend: npm run dev" -ForegroundColor White
Write-Host "4. Teste a autenticação" -ForegroundColor White
Write-Host "`n🔗 Keycloak Admin: https://keycloak-hlg.extrata.com.br/admin" -ForegroundColor Cyan
Write-Host "📁 Realm: extrata" -ForegroundColor Cyan

Write-Host "`n💡 Para limpar o localStorage do navegador:" -ForegroundColor Yellow
Write-Host "   - Abra o DevTools (F12)" -ForegroundColor White
Write-Host "   - Vá em Application > Storage > Local Storage" -ForegroundColor White
Write-Host "   - Delete todas as chaves relacionadas ao Keycloak" -ForegroundColor White
Write-Host "   - Ou execute no console: localStorage.clear()" -ForegroundColor White
