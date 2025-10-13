# Extrata Academy - Testes Automatizados
# ======================================

Write-Host "🚀 Extrata Academy - Testes Automatizados" -ForegroundColor Blue
Write-Host "==========================================" -ForegroundColor Blue

# Função para log colorido
function Write-Log {
    param([string]$Message, [string]$Type = "INFO")
    
    $timestamp = Get-Date -Format "HH:mm:ss"
    $color = switch ($Type) {
        "ERROR" { "Red" }
        "SUCCESS" { "Green" }
        "WARNING" { "Yellow" }
        default { "Cyan" }
    }
    
    Write-Host "[$timestamp] $Message" -ForegroundColor $color
}

# Verificar se Node.js está instalado
try {
    $nodeVersion = node --version
    Write-Log "Node.js encontrado: $nodeVersion" "SUCCESS"
} catch {
    Write-Log "Node.js não encontrado. Instale Node.js primeiro." "ERROR"
    exit 1
}

# Verificar se npm está instalado
try {
    $npmVersion = npm --version
    Write-Log "npm encontrado: $npmVersion" "SUCCESS"
} catch {
    Write-Log "npm não encontrado. Instale npm primeiro." "ERROR"
    exit 1
}

Write-Log "Verificando dependências..."

# Instalar dependências se necessário
if (-not (Test-Path "node_modules")) {
    Write-Log "Instalando dependências do Playwright..."
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Log "Falha ao instalar dependências" "ERROR"
        exit 1
    }
    Write-Log "Dependências instaladas" "SUCCESS"
} else {
    Write-Log "Dependências já instaladas" "SUCCESS"
}

# Instalar browsers do Playwright
Write-Log "Instalando browsers do Playwright..."
npx playwright install
if ($LASTEXITCODE -ne 0) {
    Write-Log "Falha ao instalar browsers" "ERROR"
    exit 1
}
Write-Log "Browsers instalados" "SUCCESS"

# Verificar se os serviços estão rodando
Write-Log "Verificando serviços..."

# Verificar frontend
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5
    Write-Log "Frontend rodando em localhost:3000" "SUCCESS"
} catch {
    Write-Log "Frontend não está rodando em localhost:3000" "WARNING"
}

# Verificar backend
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/api" -UseBasicParsing -TimeoutSec 5
    Write-Log "Backend rodando em localhost:4000" "SUCCESS"
} catch {
    Write-Log "Backend não está rodando em localhost:4000" "WARNING"
}

# Executar testes
Write-Log "Iniciando testes automatizados..."
Write-Host ""

# Executar todos os testes
npx playwright test --reporter=html,json,junit

# Verificar resultado
if ($LASTEXITCODE -eq 0) {
    Write-Log "Todos os testes passaram!" "SUCCESS"
} else {
    Write-Log "Alguns testes falharam" "ERROR"
}

# Mostrar relatório
Write-Log "Abrindo relatório HTML..."
npx playwright show-report

Write-Host ""
Write-Host "🎉 Testes concluídos!" -ForegroundColor Green
Write-Host "📊 Relatórios gerados:" -ForegroundColor Blue
Write-Host "   - HTML: playwright-report/index.html" -ForegroundColor White
Write-Host "   - JSON: test-results.json" -ForegroundColor White
Write-Host "   - JUnit: test-results.xml" -ForegroundColor White


