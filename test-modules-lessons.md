# Testes de Módulos e Lições

## Informações
- **Backend**: http://localhost:4000/api
- **Course ID**: d418b7f9-99a4-4716-b4c9-e32e8fc585a8

## Como obter o token
1. Abra o navegador em http://localhost:3000
2. Faça login
3. Abra DevTools (F12) > Console
4. Execute: `localStorage.getItem('keycloak-token')`
5. Copie o token (sem aspas)
6. Substitua `YOUR_TOKEN` nos comandos abaixo

---

## 1. Criar Módulo

```bash
curl -X POST http://localhost:4000/api/modules \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"courseId\":\"d418b7f9-99a4-4716-b4c9-e32e8fc585a8\",\"title\":\"Módulo 1 - Introdução\",\"description\":\"Primeiro módulo do curso\",\"order\":1}"
```

**Resposta esperada:**
```json
{
  "id": "uuid-gerado",
  "courseId": "d418b7f9-99a4-4716-b4c9-e32e8fc585a8",
  "title": "Módulo 1 - Introdução",
  "description": "Primeiro módulo do curso",
  "order": 1,
  "duration": 0,
  "isActive": true,
  "createdAt": "...",
  "updatedAt": "..."
}
```

**Guardar o ID do módulo para os próximos testes!**

---

## 2. Listar Módulos do Curso

```bash
curl -X GET "http://localhost:4000/api/modules/course/d418b7f9-99a4-4716-b4c9-e32e8fc585a8" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 3. Criar Lição (substitua MODULE_ID)

```bash
curl -X POST http://localhost:4000/api/lessons \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"moduleId\":\"MODULE_ID\",\"title\":\"Lição 1 - Bem-vindo\",\"description\":\"Primeira lição do módulo\",\"contentType\":\"video\",\"content\":{\"videoUrl\":\"https://youtube.com/watch?v=example\",\"videoProvider\":\"youtube\",\"videoId\":\"example\"},\"duration\":300,\"order\":1}"
```

**Resposta esperada:**
```json
{
  "id": "uuid-gerado",
  "moduleId": "...",
  "title": "Lição 1 - Bem-vindo",
  "description": "Primeira lição do módulo",
  "contentType": "video",
  "content": {
    "videoUrl": "https://youtube.com/watch?v=example",
    "videoProvider": "youtube",
    "videoId": "example"
  },
  "duration": 300,
  "order": 1,
  "isActive": true,
  "isFree": false,
  "createdAt": "...",
  "updatedAt": "..."
}
```

---

## 4. Listar Lições do Módulo (substitua MODULE_ID)

```bash
curl -X GET "http://localhost:4000/api/lessons/module/MODULE_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 5. Criar Segunda Lição

```bash
curl -X POST http://localhost:4000/api/lessons \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"moduleId\":\"MODULE_ID\",\"title\":\"Lição 2 - Conteúdo em Texto\",\"description\":\"Segunda lição\",\"contentType\":\"text\",\"content\":{\"textContent\":\"<h1>Olá!</h1><p>Este é o conteúdo da lição.</p>\"},\"duration\":180,\"order\":2}"
```

---

## 6. Atualizar Duração do Módulo (substitua MODULE_ID)

Calcula automaticamente a soma das durações das lições

```bash
curl -X PATCH "http://localhost:4000/api/modules/MODULE_ID/update-duration" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 7. Ver Módulo com Duração Atualizada (substitua MODULE_ID)

```bash
curl -X GET "http://localhost:4000/api/modules/MODULE_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 8. Reordenar Lições (substitua MODULE_ID e LESSON_IDs)

```bash
curl -X POST "http://localhost:4000/api/lessons/module/MODULE_ID/reorder" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"lessonOrders\":[{\"id\":\"LESSON_ID_2\",\"order\":1},{\"id\":\"LESSON_ID_1\",\"order\":2}]}"
```

---

## 9. Duplicar Módulo (substitua MODULE_ID)

```bash
curl -X POST "http://localhost:4000/api/modules/MODULE_ID/duplicate" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 10. Listar Todos os Módulos

```bash
curl -X GET "http://localhost:4000/api/modules" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Testes de Progresso (após ter ENROLLMENT_ID e LESSON_ID)

### Marcar Lição como Completada

```bash
curl -X POST "http://localhost:4000/api/lessons/LESSON_ID/complete" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"enrollmentId\":\"ENROLLMENT_ID\"}"
```

### Atualizar Tempo de Visualização

```bash
curl -X POST "http://localhost:4000/api/lessons/LESSON_ID/watch-time" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"enrollmentId\":\"ENROLLMENT_ID\",\"watchTime\":150,\"lastPosition\":150}"
```

### Ver Progresso da Matrícula

```bash
curl -X GET "http://localhost:4000/api/lessons/enrollment/ENROLLMENT_ID/progress" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Comandos PowerShell (Windows)

Se preferir usar PowerShell em vez de curl, aqui está o exemplo para criar um módulo:

```powershell
$token = "YOUR_TOKEN"
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}
$body = @{
    courseId = "d418b7f9-99a4-4716-b4c9-e32e8fc585a8"
    title = "Módulo 1 - Introdução"
    description = "Primeiro módulo do curso"
    order = 1
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:4000/api/modules" -Method POST -Headers $headers -Body $body
```
