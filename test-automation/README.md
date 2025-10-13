# 🧪 Testes Automatizados - Extrata Academy

Sistema de testes automatizado 100% autônomo para validar todas as funcionalidades da plataforma Extrata Academy.

## 🎯 Objetivo

Testar automaticamente todas as funcionalidades do sistema usando as credenciais:
- **Usuário**: `73023990182`
- **Senha**: `Dessis12!`

## 📋 Funcionalidades Testadas

### ✅ Autenticação
- Login com credenciais válidas
- Exibição de informações do usuário
- Logout correto

### ✅ Cursos
- Listagem de cursos disponíveis
- Visualização de detalhes do curso
- Botão "Iniciar Curso" para usuários matriculados
- Navegação para página de aprendizado
- Exibição de progresso

### ✅ Sistema de Quizzes
- Acesso a quizzes através de lições
- Interface do quiz player
- Resposta a questões
- Exibição de resultados

### ✅ Gamificação
- Sistema de XP no dashboard
- Leaderboard
- Achievements
- Adição manual de XP
- Atualização de streak
- Notificações de gamificação

### ✅ PWA (Progressive Web App)
- Carregamento do manifest.json
- Service Worker registrado
- Prompt de instalação PWA
- Ícones PWA configurados
- Funcionamento offline
- Meta tags PWA corretas

### ✅ Modo Escuro
- Toggle de tema no dashboard
- Alternância entre modo claro e escuro
- Aplicação correta do modo escuro
- Manutenção do tema entre páginas
- Transições suaves

### ✅ Fluxo Completo
- Execução de fluxo completo do sistema
- Teste de responsividade
- Validação de todas as funcionalidades
- Geração de relatório de status

## 🚀 Como Executar

### Pré-requisitos

1. **Node.js** (versão 16 ou superior)
2. **npm** ou **yarn**
3. **Frontend** rodando em `http://localhost:3000`
4. **Backend** rodando em `http://localhost:4000`

### Instalação e Execução

#### Windows (PowerShell)
```powershell
cd test-automation
.\setup-and-run.ps1
```

#### Linux/Mac (Bash)
```bash
cd test-automation
chmod +x setup-and-run.sh
./setup-and-run.sh
```

#### Manual
```bash
cd test-automation
npm install
npx playwright install
npx playwright test
```

## 📊 Relatórios

Os testes geram múltiplos tipos de relatório:

### HTML (Interativo)
- Relatório visual com screenshots
- Vídeos de falhas
- Timeline de execução
- Acessível em: `playwright-report/index.html`

### JSON (Programático)
- Dados estruturados para análise
- Arquivo: `test-results.json`

### JUnit (CI/CD)
- Compatível com sistemas de CI/CD
- Arquivo: `test-results.xml`

## 🎮 Execução de Testes Específicos

### Executar apenas autenticação
```bash
npx playwright test tests/auth.spec.ts
```

### Executar apenas cursos
```bash
npx playwright test tests/courses.spec.ts
```

### Executar com interface visual
```bash
npx playwright test --ui
```

### Executar em modo debug
```bash
npx playwright test --debug
```

### Executar em modo headed (ver browser)
```bash
npx playwright test --headed
```

## 🔧 Configuração

### Browsers Suportados
- Chrome/Chromium
- Firefox
- Safari/WebKit
- Mobile Chrome
- Mobile Safari

### Configurações Personalizáveis

Edite `playwright.config.ts` para:
- Alterar timeout
- Configurar retries
- Adicionar novos browsers
- Modificar reporter

## 📱 Testes Mobile

Os testes incluem validação em dispositivos móveis:
- iPhone 12
- Pixel 5
- Responsividade em diferentes tamanhos

## 🐛 Debugging

### Logs Detalhados
```bash
DEBUG=pw:api npx playwright test
```

### Screenshots de Falhas
Screenshots são automaticamente capturadas em caso de falha e salvas em `test-results/`

### Vídeos de Execução
Vídeos são gravados para testes que falham e salvos em `test-results/`

## 📈 Métricas de Qualidade

### Critérios de Sucesso
- ✅ Taxa de sucesso ≥ 80%
- ✅ Todos os fluxos críticos funcionando
- ✅ Responsividade validada
- ✅ PWA funcionando
- ✅ Modo escuro operacional

### Monitoramento
- Tempo de execução
- Taxa de falhas por funcionalidade
- Cobertura de testes
- Performance de carregamento

## 🔄 Integração CI/CD

### GitHub Actions
```yaml
- name: Run Playwright tests
  run: |
    cd test-automation
    npm install
    npx playwright install
    npx playwright test
```

### Jenkins
```groovy
stage('Test') {
    steps {
        sh 'cd test-automation && npm install'
        sh 'cd test-automation && npx playwright install'
        sh 'cd test-automation && npx playwright test'
    }
    post {
        always {
            publishHTML([
                allowMissing: false,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'test-automation/playwright-report',
                reportFiles: 'index.html',
                reportName: 'Playwright Report'
            ])
        }
    }
}
```

## 🆘 Solução de Problemas

### Erro: "Browser not found"
```bash
npx playwright install
```

### Erro: "Connection refused"
- Verificar se frontend está rodando em localhost:3000
- Verificar se backend está rodando em localhost:4000

### Erro: "Login failed"
- Verificar credenciais no arquivo de teste
- Verificar se Keycloak está configurado corretamente

### Timeout em testes
- Aumentar timeout no `playwright.config.ts`
- Verificar performance da aplicação

## 📞 Suporte

Para problemas ou dúvidas:
1. Verificar logs de execução
2. Consultar relatórios HTML
3. Executar testes em modo debug
4. Verificar configurações do sistema

---

**🎉 Sistema de testes 100% autônomo e confiável para Extrata Academy!**


