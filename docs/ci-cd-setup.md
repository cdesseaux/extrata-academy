# 🚀 CI/CD Pipeline - Extrata Academy

## Visão Geral

Pipeline automatizado de CI/CD usando **GitHub Actions** para testes, build e deploy do Extrata Academy LMS.

---

## 🔄 Workflow Atual

### Triggers
- **Push** para branches: `master`, `develop`
- **Pull Requests** para: `master`

### Jobs

#### 1. **Test** (Sempre executa)
- ✅ Testes unitários do backend
- ✅ Lint do backend
- ✅ Testes do frontend (placeholder)
- ✅ Lint do frontend
- ✅ Build do frontend

**Services:**
- PostgreSQL 15
- Redis 7

**Tempo estimado:** ~5-8 minutos

#### 2. **Build & Push** (Apenas branch `master`)
- 🐳 Build de imagens Docker para produção
- 📦 Push para GitHub Container Registry (ghcr.io)
- 🏷️ Tags automáticas:
  - `latest` (branch master)
  - `{branch}-{sha}` (todas as branches)
  - Metadata do commit

**Imagens geradas:**
- `ghcr.io/{repo}-backend:latest`
- `ghcr.io/{repo}-frontend:latest`

**Tempo estimado:** ~10-15 minutos

#### 3. **Security Scan** (Apenas branch `master`)
- 🔒 Trivy vulnerability scanner
- 📊 Upload de resultados para GitHub Security tab
- ⚠️ Alertas automáticos de vulnerabilidades

**Tempo estimado:** ~3-5 minutos

#### 4. **Deploy Staging** (Branch `develop`)
- 🎭 Deploy automático para ambiente de staging
- ⚠️ **TODO**: Implementar comandos de deploy

#### 5. **Deploy Production** (Branch `master`)
- 🚀 Deploy para produção
- 🔐 Requer aprovação manual (environment protection)
- ⚠️ **TODO**: Implementar comandos de deploy

---

## 📋 Status Atual

### ✅ Configurado
- [x] Testes automatizados (backend)
- [x] Build de imagens Docker
- [x] Push para Container Registry
- [x] Security scanning
- [x] Estrutura de deploy (staging/prod)
- [x] Branch master configurada
- [x] Frontend test script (placeholder)

### ⚠️ Pendente
- [ ] Implementar comandos reais de deploy
- [ ] Configurar secrets no GitHub
- [ ] Testes frontend (Jest/Vitest)
- [ ] Configurar ambientes no GitHub (staging/production)
- [ ] Implementar rollback automático
- [ ] Notificações (Slack/Discord)

---

## 🔧 Configuração

### Secrets Necessários

Configure os seguintes secrets no GitHub repository:

```bash
# AWS (para deploy)
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_REGION

# Docker Registry (automático via GITHUB_TOKEN)
GITHUB_TOKEN  # Gerado automaticamente

# Database (para testes)
# Não necessário - usa services do workflow

# Keycloak (opcional, para testes E2E)
KEYCLOAK_URL
KEYCLOAK_REALM
KEYCLOAK_CLIENT_SECRET
```

### Ambientes GitHub

Crie os seguintes environments:

1. **staging**
   - URL: https://staging.academy.extrata.com.br
   - Sem proteção (deploy automático)

2. **production**
   - URL: https://academy.extrata.com.br
   - ✅ Required reviewers: 1-2 pessoas
   - ✅ Wait timer: 5 minutos (opcional)

---

## 🐳 Imagens Docker

### Backend
```dockerfile
# Multi-stage build otimizado
FROM node:18-alpine AS builder
# ... build steps ...

FROM node:18-alpine AS production
# Imagem final ~150MB
# User: nestjs (non-root)
# Port: 4000
# Healthcheck: /api/health
```

### Frontend
```dockerfile
# Next.js standalone output
FROM node:18-alpine AS builder
# ... build steps ...

FROM node:18-alpine AS production
# Imagem final ~120MB
# User: nextjs (non-root)
# Port: 3000
# Healthcheck: /api/health
```

---

## 📊 Testes

### Backend (Coverage: 61%)

```bash
# Testes unitários
npm test

# Cobertura
npm run test:cov

# E2E
npm run test:e2e
```

**Módulos testados:**
- Files (75.38%)
- Gamification (75.67%)
- Enrollments (81.05%)
- Certificates (49.54%)
- Learning Paths (86.9%)
- Lessons (88.78%)
- Modules (88.4%)
- Quizzes (85.9%)

### Frontend

```bash
# Placeholder
npm test  # exit 0
```

**TODO:** Implementar testes com Jest ou Vitest

---

## 🚀 Deploy Manual

### Via Docker Compose (Produção)

```bash
# 1. Pull das imagens
docker pull ghcr.io/{repo}-backend:latest
docker pull ghcr.io/{repo}-frontend:latest

# 2. Deploy
docker-compose -f docker-compose.production.yml up -d

# 3. Verificar
docker-compose ps
docker-compose logs -f
```

### Via Kubernetes (Futuro)

```bash
# Aplicar manifests
kubectl apply -f k8s/

# Verificar rollout
kubectl rollout status deployment/backend
kubectl rollout status deployment/frontend

# Rollback se necessário
kubectl rollout undo deployment/backend
```

---

## 🔍 Monitoramento

### Logs do CI/CD

```bash
# Ver runs
https://github.com/{org}/{repo}/actions

# Filtrar por workflow
https://github.com/{org}/{repo}/actions/workflows/ci-cd.yml
```

### Imagens no Registry

```bash
# Listar imagens
https://github.com/{org}/{repo}/pkgs/container/{package}

# Pull manual
docker pull ghcr.io/{org}/{repo}-backend:latest
```

### Security Alerts

```bash
# Ver vulnerabilidades
https://github.com/{org}/{repo}/security
```

---

## 🐛 Troubleshooting

### Testes falhando

```bash
# Rodar localmente
docker-compose exec backend npm test

# Ver logs completos
docker-compose logs backend
```

### Build falhando

```bash
# Testar Dockerfile localmente
docker build -f backend/Dockerfile.production backend/

# Ver cache do Docker
docker system df
docker builder prune
```

### Deploy falhando

```bash
# Verificar secrets
# GitHub > Settings > Secrets > Actions

# Verificar environments
# GitHub > Settings > Environments

# Ver logs do workflow
# Actions > Select Run > View Logs
```

---

## 📈 Próximos Passos

### Curto Prazo
1. ✅ Implementar deploy real (staging/production)
2. ✅ Adicionar testes frontend
3. ✅ Configurar secrets e environments
4. ✅ Adicionar notificações

### Médio Prazo
1. ⏳ Migrar para Kubernetes
2. ⏳ Implementar blue-green deployment
3. ⏳ Adicionar smoke tests pós-deploy
4. ⏳ Monitoramento com Prometheus/Grafana

### Longo Prazo
1. 📋 GitOps com ArgoCD
2. 📋 Feature flags
3. 📋 A/B testing
4. 📋 Canary deployments

---

## 📚 Referências

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Docker Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [Next.js Standalone Output](https://nextjs.org/docs/advanced-features/output-file-tracing)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)

---

**Última atualização:** 2025-10-19
**Mantido por:** Equipe Extrata
