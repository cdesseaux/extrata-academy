# 🎓 Extrata Academy LMS

Sistema completo de Learning Management System (LMS) desenvolvido para capacitação e certificação de usuários do sistema Extrata.

## 🚀 Versão Atual: 1.0.0

### ✨ Funcionalidades Principais

- **🔐 Autenticação Segura**: Integração completa com Keycloak
- **📚 Gerenciamento de Cursos**: Criação, edição e organização de cursos
- **🎥 Player de Vídeo Avançado**: Reprodução com anotações, legendas e bookmarks
- **📄 Visualizador de PDF**: Leitura com sistema de notas
- **🏆 Sistema de Gamificação**: XP, badges e leaderboard
- **📜 Certificados**: Geração automática e validação via QR Code
- **☁️ Storage S3**: Upload seguro de arquivos com presigned URLs
- **🛣️ Trilhas de Aprendizagem**: Caminhos estruturados de cursos
- **📊 Dashboard Completo**: Acompanhamento de progresso em tempo real
- **✅ Testes Automatizados**: 61% de cobertura (255 testes)

### 🛠️ Tecnologias

**Frontend:**
- Next.js 15.5.4
- React 19
- TypeScript
- Tailwind CSS 4
- Keycloak JS
- React Player (video)

**Backend:**
- NestJS 11
- TypeScript
- PostgreSQL 15
- TypeORM
- JWT Authentication
- AWS S3 (file storage)

**Infraestrutura:**
- Docker & Docker Compose
- Nginx
- Keycloak (external)
- Redis 7
- GitHub Actions (CI/CD)

### 🚀 Início Rápido

1. **Clone o repositório:**
   ```bash
   git clone <repository-url>
   cd extrata-academy
   ```

2. **Configure as variáveis de ambiente:**
   ```bash
   cp .env.example .env
   # Edite o arquivo .env com suas configurações
   ```

3. **Inicie com Docker:**
   ```bash
   docker-compose up -d
   ```

4. **Acesse a aplicação:**
   - Frontend: http://localhost:3001
   - Backend: http://localhost:4000
   - Keycloak: http://localhost:8080

### 📋 Correções Implementadas

- ✅ **Erro 400 de autenticação Keycloak** - Resolvido
- ✅ **Sistema de login/logout robusto** - Implementado
- ✅ **Carregamento de certificados** - Funcionando
- ✅ **Download de PDFs** - Corrigido
- ✅ **Dashboard limpo** - Elementos de teste removidos
- ✅ **Interface profissional** - Pronta para produção

### 🏗️ Estrutura do Projeto

```
extrata-academy/
├── frontend/          # Aplicação Next.js
├── backend/           # API NestJS
├── docs/             # Documentação
├── scripts/          # Scripts de automação
├── test-automation/  # Testes E2E com Playwright
└── docker-compose.yml
```

### 📚 Documentação

- [Setup S3 Storage](docs/s3-storage-setup.md)
- [Curso Aluno (Conteúdo)](docs/curso-aluno-extrata-academy.md)
- Backend API: http://localhost:4000/api/docs (Swagger)

### 🧪 Testes

**Backend (61% coverage - 255 testes):**
```bash
# Rodar todos os testes
docker-compose exec backend npm test

# Testes com coverage
docker-compose exec backend npm run test:cov

# Testes E2E
docker-compose exec backend npm run test:e2e
```

**Frontend:**
```bash
docker-compose exec frontend npm test
```

**Módulos com testes:**
- ✅ Files (upload S3, presigned URLs)
- ✅ Gamification (XP, achievements)
- ✅ Enrollments (matrículas, progresso)
- ✅ Certificates (geração PDF)
- ✅ Learning Paths (trilhas)
- ✅ Lessons & Modules
- ✅ Quizzes

### 📦 Deploy

Para produção, use:
```bash
docker-compose -f docker-compose.production.yml up -d
```

### 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### 📄 Licença

Este projeto é propriedade da Extrata e está sob licença proprietária.

### 📞 Suporte

Para suporte técnico, entre em contato com a equipe de desenvolvimento.

---

**Desenvolvido com ❤️ pela equipe Extrata**
