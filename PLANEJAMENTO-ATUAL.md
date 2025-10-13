# 📋 Planejamento Atual - Extrata Academy LMS
**Data de Atualização:** 2025-10-09
**Status:** Fase 1 Concluída ✅

---

## 🎯 Estado Atual do Projeto

### ✅ **CONCLUÍDO**

#### **Fase 0: Fundação Técnica** - 100% ✅

- ✅ DTOs e Validação (18 DTOs criados)
- ✅ Documentação Swagger em `/api/docs`
- ✅ Error Handling Global (HttpExceptionFilter)
- ✅ Testes Básicos (38 testes, 73.7% passando)

#### **Fase 1: Estrutura de Conteúdo** - 100% ✅

**Backend:**
- ✅ Module, Lesson, LessonProgress entities
- ✅ ModulesModule completo (CRUD, reorder, duplicate)
- ✅ LessonsModule completo (CRUD, reorder, progress tracking)
- ✅ FilesModule com upload (S3/Local)
- ✅ 28 endpoints de módulos e lições
- ✅ 9 endpoints de upload de arquivos

**Frontend:**
- ✅ Interfaces TypeScript (Module, Lesson, tipos)
- ✅ API Client com 37+ métodos
- ✅ Página `/courses/[id]/manage-v2` (drag & drop de módulos)
- ✅ Página `/courses/[id]/learn` (player de curso)
- ✅ Componente `AddLessonForm` com RichTextEditor e FileUpload
- ✅ Componente `FileUpload` com progress bar
- ✅ Componente `SortableLesson` (drag & drop de lições)
- ✅ Loading Skeletons integrados em 3 páginas
- ✅ Toast notifications (Sonner)

**Correções:**
- ✅ Encoding UTF-8 corrigido
- ✅ Soft delete de lições corrigido
- ✅ DELETE com HTTP 204 No Content
- ✅ JSON parse error em DELETEs corrigido

---

## 🚧 PRÓXIMAS FASES

### **Fase 2: Avaliações e Quizzes** - 0% ⏸️

**Prioridade:** 🟡 ALTA
**Tempo Estimado:** 1-2 semanas
**Objetivo:** Sistema completo de avaliações e quizzes

#### 2.1. Backend - Entidades de Quiz (2-3 dias)

**Entidades a Criar:**

```typescript
// Quiz Entity
@Entity('quizzes')
export class Quiz {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  lessonId: string;

  @Column()
  title: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ default: 70 })
  passingScore: number; // Percentual mínimo para passar

  @Column({ default: 0 })
  timeLimit: number; // em minutos (0 = sem limite)

  @Column({ default: true })
  showCorrectAnswers: boolean;

  @Column({ default: 1 })
  maxAttempts: number; // 0 = ilimitado

  @OneToMany(() => Question, question => question.quiz)
  questions: Question[];

  @Column({ default: true })
  isActive: boolean;
}
```

```typescript
// Question Entity
@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  quizId: string;

  @ManyToOne(() => Quiz, quiz => quiz.questions)
  quiz: Quiz;

  @Column('text')
  question: string;

  @Column({
    type: 'enum',
    enum: ['multiple_choice', 'true_false', 'essay'],
  })
  type: QuestionType;

  @Column('jsonb')
  options: Array<{ id: string; text: string }>;

  @Column('simple-array')
  correctAnswers: string[]; // IDs das opções corretas

  @Column({ default: 1 })
  points: number;

  @Column({ default: 0 })
  order: number;

  @Column('text', { nullable: true })
  explanation: string; // Explicação da resposta correta
}
```

```typescript
// QuizAttempt Entity
@Entity('quiz_attempts')
export class QuizAttempt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  quizId: string;

  @Column()
  userId: string;

  @Column()
  enrollmentId: string;

  @Column('jsonb')
  answers: Array<{ questionId: string; answer: string[] }>;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  score: number;

  @Column({ default: false })
  passed: boolean;

  @Column({ nullable: true })
  startedAt: Date;

  @Column({ nullable: true })
  completedAt: Date;

  @Column({ default: 1 })
  attemptNumber: number;
}
```

**Tarefas:**
- [ ] Criar entidades Quiz, Question, QuizAttempt
- [ ] Criar enum QuestionType
- [ ] Criar migrations
- [ ] Adicionar relacionamento em Lesson entity

---

#### 2.2. Backend - Services e Controllers (2-3 dias)

**QuizzesService:**

```typescript
class QuizzesService {
  // CRUD básico
  async create(createQuizDto: CreateQuizDto): Promise<Quiz>
  async findAll(): Promise<Quiz[]>
  async findOne(id: string): Promise<Quiz>
  async update(id: string, updateQuizDto: UpdateQuizDto): Promise<Quiz>
  async remove(id: string): Promise<void>

  // Operações de quiz
  async getQuizByLesson(lessonId: string): Promise<Quiz>
  async addQuestion(quizId: string, question: CreateQuestionDto): Promise<Question>
  async updateQuestion(questionId: string, data: UpdateQuestionDto): Promise<Question>
  async deleteQuestion(questionId: string): Promise<void>
  async reorderQuestions(quizId: string, questionIds: string[]): Promise<void>

  // Tentativas
  async startAttempt(quizId: string, userId: string, enrollmentId: string): Promise<QuizAttempt>
  async submitAnswer(attemptId: string, questionId: string, answer: string[]): Promise<void>
  async submitQuiz(attemptId: string): Promise<QuizAttempt>
  async gradeQuiz(attemptId: string): Promise<QuizAttempt>

  // Consultas
  async getAttempts(userId: string, quizId: string): Promise<QuizAttempt[]>
  async canRetake(userId: string, quizId: string): Promise<boolean>
  async getBestAttempt(userId: string, quizId: string): Promise<QuizAttempt>
}
```

**Endpoints:**
```
GET    /api/quizzes
GET    /api/quizzes/:id
POST   /api/quizzes
PATCH  /api/quizzes/:id
DELETE /api/quizzes/:id

GET    /api/quizzes/lesson/:lessonId
POST   /api/quizzes/:id/questions
PATCH  /api/quizzes/questions/:questionId
DELETE /api/quizzes/questions/:questionId
POST   /api/quizzes/:id/questions/reorder

POST   /api/quizzes/:id/start
POST   /api/quiz-attempts/:id/answer
POST   /api/quiz-attempts/:id/submit
GET    /api/quiz-attempts/:id
GET    /api/quizzes/:id/my-attempts
GET    /api/quizzes/:id/can-retake
```

**Tarefas:**
- [ ] Criar QuizzesModule, QuizzesService, QuizzesController
- [ ] Implementar lógica de correção automática
- [ ] Validar limite de tentativas
- [ ] Calcular pontuação
- [ ] Atualizar progresso da lição ao passar no quiz
- [ ] Criar DTOs de validação

---

#### 2.3. Frontend - Editor de Quiz (Instrutor) (2-3 dias)

**Componentes a Criar:**

```typescript
// Página de editor de quiz
/app/courses/[id]/lessons/[lessonId]/quiz/edit/page.tsx

// Componentes
/components/QuizEditor.tsx          // Editor principal
/components/QuestionEditor.tsx      // Editor de questão individual
/components/QuestionList.tsx        // Lista de questões (drag & drop)
/components/QuizSettings.tsx        // Configurações do quiz
/components/AnswerOptionsEditor.tsx // Editor de opções de resposta
```

**Funcionalidades:**
- [ ] Criar/editar quiz
- [ ] Adicionar questões (múltipla escolha, verdadeiro/falso)
- [ ] Definir respostas corretas
- [ ] Adicionar explicações
- [ ] Reordenar questões (drag & drop)
- [ ] Configurar quiz (tempo limite, tentativas, nota mínima)
- [ ] Preview do quiz
- [ ] Validação de formulário

---

#### 2.4. Frontend - Interface de Quiz (Aluno) (2-3 dias)

**Componentes a Criar:**

```typescript
// Páginas
/app/courses/[id]/lessons/[lessonId]/quiz/page.tsx        // Fazer quiz
/app/courses/[id]/lessons/[lessonId]/quiz/results/page.tsx // Resultados

// Componentes
/components/QuizPlayer.tsx          // Player de quiz
/components/QuestionCard.tsx        // Card de questão
/components/QuizTimer.tsx           // Timer countdown
/components/QuizNavigation.tsx      // Navegação entre questões
/components/QuizResults.tsx         // Tela de resultados
/components/QuizFeedback.tsx        // Feedback por questão
```

**Funcionalidades:**
- [ ] Iniciar tentativa
- [ ] Timer (se configurado)
- [ ] Navegação entre questões
- [ ] Marcar questões para revisão
- [ ] Barra de progresso
- [ ] Botão "Finalizar Quiz"
- [ ] Modal de confirmação
- [ ] Tela de resultados
  - Score em %
  - Aprovado/Reprovado
  - Gabarito (se configurado)
  - Feedback por questão
  - Explicações
  - Botão "Tentar Novamente" (se permitido)
- [ ] Histórico de tentativas
- [ ] Melhor tentativa destacada

---

### **Fase 3: Gamificação e Certificados** - 0% ⏸️

**Prioridade:** 🟡 MÉDIA
**Tempo Estimado:** 1 semana
**Objetivo:** Engajamento e reconhecimento

#### 3.1. Sistema de Conquistas (Achievements) (2-3 dias)

**Backend:**
- [ ] Achievement Entity
- [ ] UserAchievement Entity (many-to-many)
- [ ] AchievementsService
- [ ] Triggers automáticos:
  - Primeira lição concluída
  - Primeiro curso concluído
  - 10 lições concluídas
  - 100% em quiz
  - Sequência de 7 dias estudando
  - etc.

**Frontend:**
- [ ] Badge de conquista
- [ ] Modal de "Nova Conquista Desbloqueada!"
- [ ] Página de conquistas
- [ ] Progresso de conquistas

---

#### 3.2. Melhorias em Certificados (2 dias)

**Atual:** Certificados básicos já existem ✅

**Melhorias a Fazer:**
- [ ] Template de certificado mais bonito (PDF)
- [ ] Assinatura digital
- [ ] QR Code de verificação
- [ ] Compartilhar no LinkedIn
- [ ] Galeria de certificados no perfil
- [ ] Email automático ao receber certificado

---

#### 3.3. Sistema de Pontos (XP) (2 dias)

**Backend:**
- [ ] Adicionar campo `xp` em User entity
- [ ] XP por ação:
  - Completar lição: 10 XP
  - Passar em quiz: 20 XP
  - Completar curso: 100 XP
  - Sequência diária: 5 XP/dia
- [ ] Níveis (Iniciante, Intermediário, Avançado, Expert)
- [ ] Leaderboard

**Frontend:**
- [ ] Barra de XP no header
- [ ] Badge de nível
- [ ] Página de leaderboard
- [ ] Animação ao ganhar XP

---

### **Fase 4: Interação e Comunidade** - 0% ⏸️

**Prioridade:** 🟡 MÉDIA
**Tempo Estimado:** 1-2 semanas
**Objetivo:** Engajamento e suporte

#### 4.1. Sistema de Discussões (3-4 dias)

**Backend:**
- [ ] Discussion Entity (fórum por curso)
- [ ] Comment Entity (respostas)
- [ ] DiscussionsModule
- [ ] Sistema de likes/upvotes
- [ ] Marcar resposta como "solução"
- [ ] Notificações de respostas

**Frontend:**
- [ ] Página de discussões do curso
- [ ] Criar novo tópico
- [ ] Responder tópico
- [ ] Like/Upvote
- [ ] Filtros (todas, minhas, sem resposta, resolvidas)
- [ ] Busca em discussões

---

#### 4.2. Sistema de Perguntas por Lição (2-3 dias)

**Backend:**
- [ ] LessonQuestion Entity
- [ ] Vinculado a timestamp do vídeo (opcional)

**Frontend:**
- [ ] Botão "Fazer pergunta" no player
- [ ] Campo de timestamp automático
- [ ] Lista de perguntas da lição
- [ ] Filtrar por timestamp

---

#### 4.3. Sistema de Notificações (3-4 dias)

**Backend:**
- [ ] Notification Entity
- [ ] NotificationsService
- [ ] Tipos:
  - Nova resposta em discussão
  - Novo curso disponível
  - Conquista desbloqueada
  - Certificado emitido
  - Lembrete de curso em progresso
- [ ] WebSocket (Socket.io) para real-time
- [ ] Email transacional (opcional)

**Frontend:**
- [ ] Sino de notificações no header
- [ ] Badge de contador
- [ ] Dropdown de notificações
- [ ] Página de todas as notificações
- [ ] Marcar como lida
- [ ] Marcar todas como lidas

---

### **Fase 5: Analytics e Relatórios** - 0% ⏸️

**Prioridade:** 🟡 MÉDIA
**Tempo Estimado:** 1 semana
**Objetivo:** Insights e métricas

#### 5.1. Dashboard do Instrutor (3-4 dias)

**Backend:**
- [ ] Endpoints de estatísticas:
  ```
  GET /api/instructors/me/stats
  GET /api/courses/:id/analytics
  GET /api/courses/:id/students
  ```
- [ ] Métricas:
  - Total de alunos
  - Taxa de conclusão
  - Tempo médio de conclusão
  - Avaliações médias
  - Lições mais vistas
  - Quizzes com mais dificuldade

**Frontend:**
- [ ] Página `/instructor/dashboard`
- [ ] Cards de métricas principais
- [ ] Gráfico de matrículas (últimos 30 dias)
- [ ] Gráfico de conclusões
- [ ] Tabela de alunos
- [ ] Exportar relatórios (CSV/PDF)

---

#### 5.2. Busca Avançada de Cursos (2-3 dias)

**Backend:**
- [ ] Full-text search (PostgreSQL ou Elasticsearch)
- [ ] Filtros:
  - Categoria
  - Dificuldade
  - Duração
  - Avaliação
  - Grátis/Pago
- [ ] Ordenação (relevância, popularidade, novo, avaliação)
- [ ] Autocomplete

**Frontend:**
- [ ] Barra de busca global
- [ ] Página de resultados
- [ ] Filtros laterais
- [ ] Tags de busca aplicada
- [ ] Sugestões de busca

---

### **Fase 6: Melhorias de UX** - 20% ⏸️

**Prioridade:** 🟢 BAIXA
**Tempo Estimado:** 1 semana
**Objetivo:** Polimento e acessibilidade

#### 6.1. Player de Vídeo Avançado (2-3 dias)

**Atual:** Player básico (div com mensagem) ⚠️

**Melhorias:**
- [ ] Integrar Video.js ou Plyr
- [ ] Controle de velocidade (0.5x, 1x, 1.25x, 1.5x, 2x)
- [ ] Legendas (WebVTT)
- [ ] Picture-in-picture
- [ ] Anotações/bookmarks
- [ ] Salvar posição (auto-resume)
- [ ] Miniaturas no hover da timeline
- [ ] Modo teatro/fullscreen

---

#### 6.2. Acessibilidade (2 dias)

- [ ] ARIA labels completos
- [ ] Navegação por teclado (Tab, Enter, Esc)
- [ ] Focus visible
- [ ] Skip links
- [ ] Textos alternativos em imagens
- [ ] Contraste de cores (WCAG AA)
- [ ] Suporte a screen readers

---

#### 6.3. Modo Escuro (1-2 dias)

- [ ] Configuração no backend (user preferences)
- [ ] Toggle no header
- [ ] CSS variables para cores
- [ ] Persistir preferência
- [ ] Transição suave

---

#### 6.4. PWA e Mobile (2-3 dias)

- [ ] Service Worker
- [ ] Manifest.json
- [ ] Instalável
- [ ] Offline mode básico
- [ ] Push notifications (browser)

---

### **Fase 7: Segurança e Performance** - 0% ⏸️

**Prioridade:** 🔴 CRÍTICA (Antes de Produção)
**Tempo Estimado:** 1 semana
**Objetivo:** Preparar para produção

#### 7.1. Segurança (2-3 dias)

**Backend:**
- [ ] Helmet.js (security headers)
- [ ] Rate limiting (@nestjs/throttler)
  - Login: 5 tentativas / 15min
  - API: 100 requests / 15min
- [ ] CSRF protection
- [ ] Input sanitization (XSS prevention)
- [ ] SQL injection prevention (já ok com TypeORM)
- [ ] Secrets no .env (não commitar)
- [ ] Renovação automática de tokens
- [ ] Logout em todos os dispositivos

**Frontend:**
- [ ] Sanitizar inputs de usuário
- [ ] Content Security Policy
- [ ] HTTPS only em produção

---

#### 7.2. Performance (2-3 dias)

**Backend:**
- [ ] Implementar cache Redis
  - Cache de cursos
  - Cache de módulos/lições
  - TTL configurável
- [ ] Query optimization
  - Adicionar índices
  - Usar select() para limitar campos
  - Paginar resultados grandes
- [ ] Compression (gzip)
- [ ] Database connection pooling

**Frontend:**
- [ ] Lazy loading de componentes
- [ ] Image optimization (Next.js Image)
- [ ] Code splitting
- [ ] CDN para assets
- [ ] Minimize bundle size

---

#### 7.3. Monitoring e Logging (1-2 dias)

**Backend:**
- [ ] Winston/Pino logging
  - Diferentes níveis (error, warn, info, debug)
  - Logs em arquivo rotativo
- [ ] Sentry error tracking
- [ ] Prometheus metrics (opcional)
- [ ] Health checks avançados
  - Database connectivity
  - Redis connectivity
  - Disk space
  - Memory usage

**Frontend:**
- [ ] Error boundary global
- [ ] Sentry error tracking
- [ ] Analytics (Google Analytics ou Plausible)

---

## 📊 Priorização Sugerida

### **🔥 Sprint 1 (Esta Semana): Fase 2 - Quizzes (Backend)**
**Objetivo:** Criar fundação de quizzes
1. Criar entidades Quiz, Question, QuizAttempt (1 dia)
2. Criar QuizzesModule, Service, Controller (1.5 dias)
3. Implementar lógica de correção (0.5 dia)
4. Testar endpoints via Swagger (0.5 dia)

**Total:** 3-4 dias

---

### **🔥 Sprint 2 (Próxima Semana): Fase 2 - Quizzes (Frontend)**
**Objetivo:** Interface completa de quizzes
1. Criar editor de quiz (instrutor) (2 dias)
2. Criar player de quiz (aluno) (1.5 dias)
3. Criar tela de resultados (0.5 dia)
4. Testar fluxo end-to-end (0.5 dia)

**Total:** 4-5 dias

---

### **📅 Sprint 3: Fase 3 - Gamificação**
1. Sistema de conquistas (2 dias)
2. Melhorias em certificados (1 dia)
3. Sistema de XP e níveis (1.5 dias)
4. Leaderboard (0.5 dia)

**Total:** 5 dias

---

### **📅 Sprint 4: Fase 4 - Comunidade**
1. Sistema de discussões (3 dias)
2. Perguntas por lição (1.5 dias)
3. Sistema de notificações (2 dias)

**Total:** 6-7 dias

---

### **📅 Sprint 5: Fase 5 - Analytics**
1. Dashboard do instrutor (3 dias)
2. Busca avançada (2 dias)

**Total:** 5 dias

---

### **📅 Sprint 6: Fase 6 - UX**
1. Player de vídeo avançado (2 dias)
2. Acessibilidade (1 dia)
3. Modo escuro (1 dia)
4. PWA (1 dia)

**Total:** 5 dias

---

### **📅 Sprint 7: Fase 7 - Produção (ANTES DE LANÇAR)**
1. Segurança (2 dias)
2. Performance (2 dias)
3. Monitoring (1 dia)

**Total:** 5 dias

---

## 🎯 Roadmap Visual

```
┌─────────────────────────────────────────────────────────────┐
│ FASE 0: Fundação Técnica         [████████████] 100% ✅    │
├─────────────────────────────────────────────────────────────┤
│ FASE 1: Estrutura de Conteúdo    [████████████] 100% ✅    │
├─────────────────────────────────────────────────────────────┤
│ FASE 2: Quizzes                   [            ]   0% ⏸️   │
│   ├─ Backend (Entidades)          [            ]   0%       │
│   ├─ Backend (Lógica)             [            ]   0%       │
│   ├─ Frontend (Editor)            [            ]   0%       │
│   └─ Frontend (Player)            [            ]   0%       │
├─────────────────────────────────────────────────────────────┤
│ FASE 3: Gamificação               [            ]   0% ⏸️   │
│   ├─ Conquistas                   [            ]   0%       │
│   ├─ Certificados v2              [            ]   0%       │
│   └─ Sistema de XP                [            ]   0%       │
├─────────────────────────────────────────────────────────────┤
│ FASE 4: Comunidade                [            ]   0% ⏸️   │
│   ├─ Discussões                   [            ]   0%       │
│   ├─ Perguntas                    [            ]   0%       │
│   └─ Notificações                 [            ]   0%       │
├─────────────────────────────────────────────────────────────┤
│ FASE 5: Analytics                 [            ]   0% ⏸️   │
│   ├─ Dashboard Instrutor          [            ]   0%       │
│   └─ Busca Avançada               [            ]   0%       │
├─────────────────────────────────────────────────────────────┤
│ FASE 6: UX                        [██          ]  20% ⏸️   │
│   ├─ Player Avançado              [            ]   0%       │
│   ├─ Acessibilidade               [            ]   0%       │
│   ├─ Modo Escuro                  [            ]   0%       │
│   └─ Skeletons                    [████████████] 100% ✅   │
├─────────────────────────────────────────────────────────────┤
│ FASE 7: Produção                  [            ]   0% ⏸️   │
│   ├─ Segurança                    [            ]   0%       │
│   ├─ Performance                  [            ]   0%       │
│   └─ Monitoring                   [            ]   0%       │
└─────────────────────────────────────────────────────────────┘

PROGRESSO GERAL: ██████░░░░░░░░░░░░░░░░░░░░░░░░░ 28.5%
```

---

## ✅ Checklist de Próxima Ação

### **Imediato (Agora)**
- [x] ~~Completar Fase 1 (Upload, RichTextEditor, Drag & Drop, Skeletons)~~ ✅
- [ ] Decisão: Começar Fase 2 (Quizzes) ou outra prioridade?

### **Se Escolher Fase 2 (Quizzes):**
- [ ] Criar branch `feature/quizzes`
- [ ] Criar entidades Quiz, Question, QuizAttempt
- [ ] Criar migrations
- [ ] Implementar QuizzesService
- [ ] Criar endpoints
- [ ] Testar via Swagger
- [ ] Criar componentes frontend
- [ ] Testar fluxo completo

### **Se Escolher Fase 3 (Gamificação):**
- [ ] Criar branch `feature/gamification`
- [ ] Criar entidades Achievement, UserAchievement
- [ ] Implementar triggers de conquistas
- [ ] Melhorar template de certificado
- [ ] Implementar sistema de XP

### **Se Escolher Melhorar Qualidade:**
- [ ] Corrigir 10 testes falhando
- [ ] Adicionar testes E2E
- [ ] Aumentar cobertura de testes
- [ ] Refatorar código duplicado
- [ ] Melhorar documentação

---

## 🎓 Recomendação de Prioridade

### **🌟 Melhor Caminho: Fase 2 (Quizzes)**

**Motivo:**
1. ✅ Fase 1 está 100% completa
2. 🎯 Quizzes são essenciais para cursos online
3. 📈 Adiciona valor significativo ao produto
4. 🧪 Permite validar aprendizado dos alunos
5. 🔄 Complementa bem a estrutura de lições

**Resultado esperado em 1-2 semanas:**
- ✅ Sistema completo de quizzes
- ✅ Instrutores podem criar avaliações
- ✅ Alunos podem fazer quizzes e ver resultados
- ✅ Progresso atualizado automaticamente
- ✅ MVP ainda mais robusto

---

## 📈 Timeline Estimado

| Sprint | Semanas | Fase | Status |
|--------|---------|------|--------|
| ✅ Sprint 0 | Semana -4 | Fase 0: Fundação | 100% ✅ |
| ✅ Sprint 1-2 | Semanas -3 a -1 | Fase 1: Conteúdo | 100% ✅ |
| 🔄 Sprint 3-4 | Semanas 1-2 | Fase 2: Quizzes | 0% ⏸️ |
| ⏸️ Sprint 5 | Semana 3 | Fase 3: Gamificação | 0% ⏸️ |
| ⏸️ Sprint 6-7 | Semanas 4-5 | Fase 4: Comunidade | 0% ⏸️ |
| ⏸️ Sprint 8 | Semana 6 | Fase 5: Analytics | 0% ⏸️ |
| ⏸️ Sprint 9 | Semana 7 | Fase 6: UX | 20% ⏸️ |
| ⏸️ Sprint 10 | Semana 8 | Fase 7: Produção | 0% ⏸️ |

**Previsão de MVP Completo:** 8-10 semanas
**Previsão de Produção:** 10-12 semanas

---

## 🚀 Próximo Passo Sugerido

### **Começar Fase 2: Sistema de Quizzes** 🎯

1️⃣ Criar entidades e migrations (1 dia)
2️⃣ Implementar backend completo (2 dias)
3️⃣ Criar editor de quiz (2 dias)
4️⃣ Criar player de quiz (2 dias)
5️⃣ Testar e refinar (1 dia)

**Total: 1-2 semanas para quizzes funcionais** 🎉

---

**Pronto para começar com Quizzes?** 🚀
