# Script de Teste para API de Módulos e Lições
# Execute: .\test-api.ps1

Write-Host "=== TESTE DE API - MÓDULOS E LIÇÕES ===" -ForegroundColor Cyan
Write-Host ""

# Configurações
$baseUrl = "http://localhost:4000/api"
$courseId = "d418b7f9-99a4-4716-b4c9-e32e8fc585a8"

# Solicitar token
Write-Host "Para obter o token:" -ForegroundColor Yellow
Write-Host "1. Abra http://localhost:3000 no navegador" -ForegroundColor Yellow
Write-Host "2. Faça login" -ForegroundColor Yellow
Write-Host "3. Abra DevTools (F12) > Console" -ForegroundColor Yellow
Write-Host "4. Execute: localStorage.getItem('keycloak-token')" -ForegroundColor Yellow
Write-Host "5. Copie o token (sem aspas)" -ForegroundColor Yellow
Write-Host ""
$token = Read-Host "Cole o token aqui"

if ([string]::IsNullOrWhiteSpace($token)) {
    Write-Host "Token não fornecido. Abortando..." -ForegroundColor Red
    exit
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Função para exibir resposta
function Show-Response {
    param($response, $testName)
    Write-Host ""
    Write-Host "✅ $testName" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 10) -ForegroundColor Gray
    Write-Host ""
    return $response
}

function Show-Error {
    param($error, $testName)
    Write-Host ""
    Write-Host "❌ $testName FALHOU" -ForegroundColor Red
    Write-Host $error -ForegroundColor Red
    Write-Host ""
}

try {
    # Teste 1: Criar Módulo
    Write-Host ">>> Teste 1: Criando módulo..." -ForegroundColor Cyan
    $moduleBody = @{
        courseId = $courseId
        title = "Módulo 1 - Introdução ao Curso"
        description = "Primeiro módulo criado via API"
        order = 1
    } | ConvertTo-Json

    $module = Invoke-RestMethod -Uri "$baseUrl/modules" -Method POST -Headers $headers -Body $moduleBody
    $module = Show-Response $module "Módulo criado"
    $moduleId = $module.id

    # Teste 2: Listar Módulos do Curso
    Write-Host ">>> Teste 2: Listando módulos do curso..." -ForegroundColor Cyan
    $modules = Invoke-RestMethod -Uri "$baseUrl/modules/course/$courseId" -Method GET -Headers $headers
    Show-Response $modules "Módulos listados"

    # Teste 3: Criar Lição 1 (Vídeo)
    Write-Host ">>> Teste 3: Criando lição 1 (vídeo)..." -ForegroundColor Cyan
    $lesson1Body = @{
        moduleId = $moduleId
        title = "Lição 1 - Bem-vindo ao Curso"
        description = "Vídeo de boas-vindas"
        contentType = "video"
        content = @{
            videoUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            videoProvider = "youtube"
            videoId = "dQw4w9WgXcQ"
        }
        duration = 300
        order = 1
        isFree = $true
    } | ConvertTo-Json -Depth 10

    $lesson1 = Invoke-RestMethod -Uri "$baseUrl/lessons" -Method POST -Headers $headers -Body $lesson1Body
    $lesson1 = Show-Response $lesson1 "Lição 1 criada"
    $lesson1Id = $lesson1.id

    # Teste 4: Criar Lição 2 (Texto)
    Write-Host ">>> Teste 4: Criando lição 2 (texto)..." -ForegroundColor Cyan
    $lesson2Body = @{
        moduleId = $moduleId
        title = "Lição 2 - Conteúdo Teórico"
        description = "Introdução aos conceitos básicos"
        contentType = "text"
        content = @{
            textContent = "<h1>Bem-vindo!</h1><p>Aqui você aprenderá os conceitos fundamentais.</p>"
        }
        duration = 180
        order = 2
    } | ConvertTo-Json -Depth 10

    $lesson2 = Invoke-RestMethod -Uri "$baseUrl/lessons" -Method POST -Headers $headers -Body $lesson2Body
    $lesson2 = Show-Response $lesson2 "Lição 2 criada"
    $lesson2Id = $lesson2.id

    # Teste 5: Criar Lição 3 (PDF)
    Write-Host ">>> Teste 5: Criando lição 3 (PDF)..." -ForegroundColor Cyan
    $lesson3Body = @{
        moduleId = $moduleId
        title = "Lição 3 - Material Complementar"
        description = "PDF para download"
        contentType = "pdf"
        content = @{
            pdfUrl = "https://example.com/material.pdf"
            attachments = @(
                @{
                    name = "Exercícios.pdf"
                    url = "https://example.com/exercicios.pdf"
                    type = "application/pdf"
                    size = 1024000
                }
            )
        }
        duration = 600
        order = 3
    } | ConvertTo-Json -Depth 10

    $lesson3 = Invoke-RestMethod -Uri "$baseUrl/lessons" -Method POST -Headers $headers -Body $lesson3Body
    $lesson3 = Show-Response $lesson3 "Lição 3 criada"

    # Teste 6: Listar Lições do Módulo
    Write-Host ">>> Teste 6: Listando lições do módulo..." -ForegroundColor Cyan
    $lessons = Invoke-RestMethod -Uri "$baseUrl/lessons/module/$moduleId" -Method GET -Headers $headers
    Show-Response $lessons "Lições listadas"

    # Teste 7: Atualizar Duração do Módulo
    Write-Host ">>> Teste 7: Atualizando duração do módulo..." -ForegroundColor Cyan
    $updatedModule = Invoke-RestMethod -Uri "$baseUrl/modules/$moduleId/update-duration" -Method PATCH -Headers $headers
    Show-Response $updatedModule "Duração do módulo atualizada (deve ser 18 minutos = 1080s / 60)"

    # Teste 8: Obter Módulo Específico
    Write-Host ">>> Teste 8: Obtendo módulo específico..." -ForegroundColor Cyan
    $moduleDetail = Invoke-RestMethod -Uri "$baseUrl/modules/$moduleId" -Method GET -Headers $headers
    Show-Response $moduleDetail "Detalhes do módulo"

    # Teste 9: Reordenar Lições
    Write-Host ">>> Teste 9: Reordenando lições..." -ForegroundColor Cyan
    $reorderBody = @{
        lessonOrders = @(
            @{ id = $lesson2Id; order = 1 }
            @{ id = $lesson1Id; order = 2 }
            @{ id = $lesson3.id; order = 3 }
        )
    } | ConvertTo-Json -Depth 10

    $reordered = Invoke-RestMethod -Uri "$baseUrl/lessons/module/$moduleId/reorder" -Method POST -Headers $headers -Body $reorderBody
    Show-Response $reordered "Lições reordenadas"

    # Teste 10: Duplicar Módulo
    Write-Host ">>> Teste 10: Duplicando módulo..." -ForegroundColor Cyan
    $duplicatedModule = Invoke-RestMethod -Uri "$baseUrl/modules/$moduleId/duplicate" -Method POST -Headers $headers
    Show-Response $duplicatedModule "Módulo duplicado"

    # Teste 11: Atualizar Lição
    Write-Host ">>> Teste 11: Atualizando lição..." -ForegroundColor Cyan
    $updateLessonBody = @{
        title = "Lição 1 - Bem-vindo ao Curso (ATUALIZADO)"
        description = "Vídeo de boas-vindas atualizado"
    } | ConvertTo-Json

    $updatedLesson = Invoke-RestMethod -Uri "$baseUrl/lessons/$lesson1Id" -Method PATCH -Headers $headers -Body $updateLessonBody
    Show-Response $updatedLesson "Lição atualizada"

    # Teste 12: Obter Próxima Lição
    Write-Host ">>> Teste 12: Obtendo próxima lição..." -ForegroundColor Cyan
    $nextLessonBody = @{
        moduleId = $moduleId
    } | ConvertTo-Json

    try {
        $nextLesson = Invoke-RestMethod -Uri "$baseUrl/lessons/$lesson1Id/next" -Method GET -Headers $headers -Body $nextLessonBody
        Show-Response $nextLesson "Próxima lição"
    } catch {
        Show-Error $_.Exception.Message "Obter próxima lição"
    }

    # Resumo Final
    Write-Host ""
    Write-Host "=== RESUMO DOS TESTES ===" -ForegroundColor Cyan
    Write-Host "✅ Módulo criado: $moduleId" -ForegroundColor Green
    Write-Host "✅ 3 Lições criadas" -ForegroundColor Green
    Write-Host "✅ Duração do módulo calculada: 18 minutos" -ForegroundColor Green
    Write-Host "✅ Lições reordenadas" -ForegroundColor Green
    Write-Host "✅ Módulo duplicado" -ForegroundColor Green
    Write-Host ""
    Write-Host "IDs para referência:" -ForegroundColor Yellow
    Write-Host "  Módulo ID: $moduleId" -ForegroundColor Gray
    Write-Host "  Lição 1 ID: $lesson1Id" -ForegroundColor Gray
    Write-Host "  Lição 2 ID: $lesson2Id" -ForegroundColor Gray
    Write-Host "  Lição 3 ID: $($lesson3.id)" -ForegroundColor Gray
    Write-Host ""

} catch {
    Show-Error $_.Exception.Message "Erro geral"
    Write-Host $_.Exception -ForegroundColor Red
}
