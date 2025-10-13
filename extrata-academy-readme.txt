# 🎓 EXTRATA ACADEMY

**Plataforma LMS customizada para capacitação e certificação de usuários do sistema Extrata**

[![Status](https://img.shields.io/badge/status-planning-yellow)]()
[![Version](https://img.shields.io/badge/version-0.1.0-blue)]()
[![License](https://img.shields.io/badge/license-MIT-green)]()

---

## 📚 Documentação Completa

Toda a documentação técnica está organizada na pasta `docs/`:

### 🎯 Planejamento e Estratégia
- **[00-PROJECT-STRUCTURE.md](docs/00-PROJECT-STRUCTURE.md)** - Estrutura completa do projeto
- **[01-EXECUTIVE-SUMMARY.md](docs/01-EXECUTIVE-SUMMARY.md)** - Visão executiva e objetivos
- **[10-IMPLEMENTATION-ROADMAP.md](docs/10-IMPLEMENTATION-ROADMAP.md)** - Roadmap de 12 semanas

### 📋 Requisitos e Arquitetura
- **[02-REQUIREMENTS.md](docs/02-REQUIREMENTS.md)** - Requisitos funcionais e não-funcionais
- **[03-ARCHITECTURE.md](docs/03-ARCHITECTURE.md)** - Arquitetura técnica completa
- **[04-DATABASE-DESIGN.md](docs/04-DATABASE-DESIGN.md)** - Design do banco de dados
- **[05-API-SPECIFICATION.md](docs/05-API-SPECIFICATION.md)** - Especificação da API REST
- **[06-FRONTEND-DESIGN.md](docs/06-FRONTEND-DESIGN.md)** - Design e UX do frontend

### 💻 Desenvolvimento e Testes
- **[07-DEVELOPMENT-GUIDE.md](docs/07-DEVELOPMENT-GUIDE.md)** - Guia completo de desenvolvimento
- **[08-TESTING-STRATEGY.md](docs/08-TESTING-STRATEGY.md)** - Estratégia de testes
- **[09-DEPLOYMENT-GUIDE.md](docs/09-DEPLOYMENT-GUIDE.md)** - Guia de deployment

---

## 🚀 Quick Start

### Pré-requisitos

- Node.js 20.x LTS
- Docker & Docker Compose
- PostgreSQL 17 (via Docker)
- Git

### Instalação Local

```bash
# 1. Clone o repositório
git clone https://github.com/your-org/extrata-academy.git
cd extrata-academy

# 2. Inicie a infraestrutura
docker-compose up -d

# 3. Configure e inicie o backend
cd backend
cp .env.example .env
npm install
npm run migration:run
npm run seed
npm run start:dev

# 4. Configure e inicie o frontend (novo terminal)
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

### Acessos

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **Swagger Docs**: http://localhost:4000/api/docs
- **Keycloak**: http://localhost:8080

### Credenciais de Teste

```
Admin:
  Email: admin@extrata.gov.br
  Password: admin123

Student:
  Email: student@extrata.gov.br
  Password: student123
```

---

## 🏗️ Arquitetura

### Stack Tecnológico

**Backend:**
- NestJS 10.x + TypeScript
- PostgreSQL 17
- TypeORM / Prisma
- Redis (cache)
- Keycloak (auth)

**Frontend:**
- Next.js 14 (App Router)
- React 18 + TypeScript
- Tailwind CSS
- shadcn/ui
- React Query

**Infrastructure:**
- Docker + Docker Compose
- GitHub Actions (CI/CD)
- AWS / DigitalOcean

### Estrutura do Projeto

```
extrata-academy/
├── docs/              # 📚 Documentação completa
├── backend/           # 🔧 API NestJS
├── frontend/          # 🎨 Next.js App
├── shared/            # 📦 Código compartilhado
├── infrastructure/    # 🚀 Docker, K8s, Terraform
├── scripts/           # 🔨 Scripts úteis
└── .github/           # CI/CD workflows
```

---

## ✨ Features

### MVP (Fase 1)
- ✅ Autenticação via SSO (Keycloak)
- ✅ CRUD completo de cursos
- ✅ Tipos de conteúdo: vídeo, texto, quiz
- ✅ Sistema de progresso e certificados
- ✅ Gamificação (XP, níveis, badges)
- ✅ Dashboard administrativo

### Roadmap Futuro
- [ ] Mobile apps nativos
- [ ] Live classes / webinars
- [ ] Comunidade integrada
- [ ] AI tutor / chatbot
- [ ] Multi-idioma
- [ ] Marketplace de cursos

---

## 🧪 Testes

```bash
# Backend
cd backend
npm run test              # Unit tests
npm run test:watch        # Watch mode
npm run test:cov          # Coverage
npm run test:e2e          # E2E tests

# Frontend
cd frontend
npm run test              # Unit tests
npm run test:e2e          # Playwright E2E
```

**Target**: 80%+ code coverage

---

## 📊 Métricas e KPIs

### Técnicas
- Uptime: 99.5%+
- API response: <200ms (p95)
- Page load: <2s
- Code coverage: >80%

### Negócio
- Course completion: >60%
- User engagement: >70%
- NPS: >50
- Support tickets: -80% (vs manual)

---

## 🤝 Contribuindo

1. Faça fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'feat: Add AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Convenções

- **Commits**: Conventional Commits (feat, fix, docs, refactor, test, chore)
- **Branches**: `feature/`, `bugfix/`, `hotfix/`, `release/`
- **Code**: ESLint + Prettier
- **Tests**: Obrigatórios para novas features

---

## 📝 Status do Projeto

### Fase Atual: **Planning** 🚧

| Fase | Status | Progresso |
|------|--------|-----------|
| 0. Setup & Planning | 🟡 In Progress | 80% |
| 1. Backend Core | 🔴 Not Started | 0% |
| 2. Frontend Core | 🔴 Not Started | 0% |
| 3. Features Avançadas | 🔴 Not Started | 0% |
| 4. Integration & Polish | 🔴 Not Started | 0% |
| 5. Beta & Launch | 🔴 Not Started | 0% |

### Próximos Passos

1. [ ] Aprovar documentação técnica
2. [ ] Setup repositório e infraestrutura
3. [ ] Kickoff meeting com time
4. [ ] Iniciar Sprint 1 (Backend Core)

---

## 👥 Time

- **Tech Lead**: [Nome]
- **Backend Dev**: [Nome]
- **Frontend Dev**: [Nome]
- **DevOps**: [Nome]
- **QA**: [Nome]
- **Product Owner**: [Nome]

---

## 📞 Contato e Suporte

- **Email**: academy@extrata.gov.br
- **Slack**: #extrata-academy
- **Jira**: [Link para board]
- **Wiki**: [Link para wiki]

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 🙏 Agradecimentos

- Time Extrata pelo produto base
- Comunidade Open Source
- Todos os contribuidores

---

**Versão**: 0.1.0  
**Última atualização**: 2025-10-06  
**Maintainer**: [Tech Lead Name]

---

<p align="center">
  <strong>🎓 Transformando a gestão pública através da educação</strong>
</p>
