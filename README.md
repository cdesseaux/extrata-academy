# 🎓 Extrata Academy LMS

Sistema completo de Learning Management System (LMS) desenvolvido para capacitação e certificação de usuários do sistema Extrata.

## 🚀 Versão Atual: 1.0.0

### ✨ Funcionalidades Principais

- **🔐 Autenticação Segura**: Integração completa com Keycloak
- **📚 Gerenciamento de Cursos**: Criação, edição e organização de cursos
- **🎥 Player de Vídeo Avançado**: Reprodução com anotações e legendas
- **📄 Visualizador de PDF**: Leitura com sistema de notas
- **🏆 Sistema de Gamificação**: XP, badges e leaderboard
- **📜 Certificados**: Geração e validação de certificados
- **📱 PWA**: Suporte offline e instalação como app
- **🌙 Tema Escuro/Claro**: Interface adaptável
- **📊 Dashboard Completo**: Acompanhamento de progresso

### 🛠️ Tecnologias

**Frontend:**
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Keycloak JS

**Backend:**
- NestJS
- TypeScript
- PostgreSQL
- Prisma ORM
- JWT Authentication

**Infraestrutura:**
- Docker & Docker Compose
- Nginx
- Keycloak
- Redis

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

- [Guia de Desenvolvimento](docs/extrata-academy-dev-guide.txt)
- [Arquitetura do Sistema](docs/extrata-academy-architecture.txt)
- [Setup de Produção](PRODUCTION-SETUP.md)
- [Guia do Keycloak](KEYCLOAK-SETUP-GUIDE.md)

### 🧪 Testes

Execute os testes automatizados:
```bash
cd test-automation
npm install
npm run test
```

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
