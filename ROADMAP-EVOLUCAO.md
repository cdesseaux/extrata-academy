# 🚀 Roadmap de Evolução - Extrata Academy

## Visão Geral

Este roadmap organiza a evolução do sistema em fases priorizadas, do mais crítico ao mais avançado.

---

## 📋 Fase 0: Fundação Técnica (1-2 semanas)

**Objetivo**: Estabelecer base sólida para desenvolvimento

### 0.1. Validação e DTOs
**Prioridade**: 🔴 CRÍTICA
**Tempo estimado**: 3 dias

- [ ] Criar DTOs para todos os módulos
  - [ ] Auth DTOs (LoginDto, RegisterDto)
  - [ ] User DTOs (CreateUserDto, UpdateUserDto)
  - [ ] Course DTOs (CreateCourseDto, UpdateCourseDto)
  - [ ] Enrollment DTOs
  - [ ] Certificate DTOs
- [ ] Implementar validação com class-validator
- [ ] Configurar ValidationPipe global
- [ ] Adicionar transformação de dados

**Arquivos**:
```
backend/src/
  auth/dto/
  users/dto/
  courses/dto/
  enrollments/dto/
  certificates/dto/
```

---

### 0.2. Documentação Swagger
**Prioridade**: 🟡 ALTA
**Tempo estimado**: 2 dias

- [ ] Configurar SwaggerModule
- [ ] Adicionar decorators @ApiTags em controllers
- [ ] Adicionar @ApiOperation em rotas
- [ ] Documentar schemas dos DTOs
- [ ] Adicionar exemplos de requests/responses
- [ ] Configurar autenticação Bearer no Swagger

**Resultado**: API documentada em `/api/docs`

---

### 0.3. Error Handling Global
**Prioridade**: 🟡 ALTA
**Tempo estimado**: 2 dias

- [ ] Criar GlobalExceptionFilter
- [ ] Criar custom exceptions
  - [ ] UserNotFoundException
  - [ ] CourseNotFoundException
  - [ ] UnauthorizedException
  - [ ] ValidationException
- [ ] Padronizar mensagens de erro
- [ ] Adicionar logging de erros

---

### 0.4. Testes Básicos
**Prioridade**: 🟡 ALTA
**Tempo estimado**: 3 dias

- [ ] Configurar ambiente de testes
- [ ] Criar testes unitários para services principais
  - [ ] AuthService
  - [ ] UsersService
  - [ ] CoursesService
  - [ ] EnrollmentsService
- [ ] Criar testes E2E para fluxos críticos
  - [ ] Login/Logout
  - [ ] Criar curso
  - [ ] Matricular em curso
  - [ ] Completar curso
- [ ] Configurar CI/CD básico

**Meta**: Cobertura mínima de 40%

---

## 📚 Fase 1: Estrutura de Conteúdo (2-3 semanas)

**Objetivo**: Implementar sistema completo de módulos e lições

### 1.1. Backend - Entidades e Relacionamentos
**Prioridade**: 🔴 CRÍTICA
**Tempo estimado**: 5 dias

#### Criar Entidades

**Module Entity**:
```typescript
@Entity('modules')
export class Module {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  courseId: string;

  @ManyToOne(() => Course, course => course.modules)
  course: Course;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({ default: 0 })
  order: number;

  @OneToMany(() => Lesson, lesson => lesson.module)
  lessons: Lesson[];

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

**Lesson Entity**:
```typescript
@Entity('lessons')
export class Lesson {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  moduleId: string;

  @ManyToOne(() => Module, module => module.lessons)
  module: Module;

  @Column()
  title: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ default: 0 })
  order: number;

  @Column({
    type: 'enum',
    enum: ['video', 'text', 'pdf', 'quiz', 'external'],
    default: 'text'
  })
  contentType: string;

  @Column('jsonb', { nullable: true })
  content: any; // Flexível para diferentes tipos

  @Column({ default: 0 })
  duration: number; // em segundos

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isFree: boolean; // Preview gratuito

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

**LessonProgress Entity**:
```typescript
@Entity('lesson_progress')
export class LessonProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  lessonId: string;

  @Column()
  enrollmentId: string;

  @Column({ default: false })
  completed: boolean;

  @Column({ nullable: true })
  completedAt: Date;

  @Column({ default: 0 })
  watchTime: number; // em segundos (para vídeos)

  @Column('jsonb', { nullable: true })
  metadata: any; // Quiz scores, etc.

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

**Tasks**:
- [ ] Criar entidades Module, Lesson, LessonProgress
- [ ] Criar relacionamentos Course -> Modules -> Lessons
- [ ] Criar migrations
- [ ] Atualizar Course entity (adicionar relation modules)
- [ ] Atualizar Enrollment para calcular progresso baseado em lições

---

### 1.2. Backend - Services e Controllers
**Prioridade**: 🔴 CRÍTICA
**Tempo estimado**: 5 dias

- [ ] Criar ModulesModule, ModulesService, ModulesController
  - [ ] CRUD de módulos
  - [ ] Reordenar módulos
  - [ ] Duplicar módulo
- [ ] Criar LessonsModule, LessonsService, LessonsController
  - [ ] CRUD de lições
  - [ ] Reordenar lições
  - [ ] Marcar como completada
  - [ ] Get próxima lição
- [ ] Atualizar EnrollmentsService
  - [ ] Calcular progresso baseado em lições completadas
  - [ ] Verificar se pode emitir certificado

---

### 1.3. Frontend - UI de Conteúdo
**Prioridade**: 🔴 CRÍTICA
**Tempo estimado**: 5 dias

- [ ] Criar página de estrutura do curso (admin/instrutor)
  - [ ] Lista de módulos
  - [ ] Adicionar/editar módulo
  - [ ] Lista de lições por módulo
  - [ ] Adicionar/editar lição
  - [ ] Drag-and-drop para reordenar
- [ ] Criar player de curso (aluno)
  - [ ] Sidebar com módulos e lições
  - [ ] Player de conteúdo (vídeo/texto/PDF)
  - [ ] Botão "Marcar como concluída"
  - [ ] Progresso visual
  - [ ] Navegação próxima/anterior
- [ ] Atualizar página de curso
  - [ ] Preview de estrutura
  - [ ] Expandir/colapsar módulos

---

### 1.4. Upload de Arquivos
**Prioridade**: 🔴 CRÍTICA
**Tempo estimado**: 3 dias

**Backend**:
- [ ] Configurar multer para upload
- [ ] Criar FileUploadModule
- [ ] Integração com S3 (já tem AWS SDK)
- [ ] Endpoints:
  - [ ] POST /api/upload/thumbnail
  - [ ] POST /api/upload/video
  - [ ] POST /api/upload/pdf
  - [ ] POST /api/upload/avatar
- [ ] Validação de tipos e tamanhos
- [ ] Gerar thumbnails de vídeo

**Frontend**:
- [ ] Componente UploadButton
- [ ] Upload com progress bar
- [ ] Preview de imagens
- [ ] Crop de avatar

---

## 🎓 Fase 2: Avaliações e Quizzes (2-3 semanas)

**Objetivo**: Sistema completo de avaliações

### 2.1. Backend - Entidades de Quiz
**Prioridade**: 🟡 ALTA
**Tempo estimado**: 4 dias

**Quiz Entity**:
```typescript
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

  @Column({ default: 10 })
  passingScore: number; // Percentual mínimo

  @Column({ default: 0 })
  timeLimit: number; // em minutos (0 = sem limite)

  @Column({ default: true })
  showCorrectAnswers: boolean;

  @Column({ default: 1 })
  maxAttempts: number; // 0 = ilimitado

  @OneToMany(() => Question, question => question.quiz)
  questions: Question[];
}
```

**Question Entity**:
```typescript
@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  quizId: string;

  @Column('text')
  question: string;

  @Column({
    type: 'enum',
    enum: ['multiple_choice', 'true_false', 'essay'],
  })
  type: string;

  @Column('jsonb')
  options: Array<{ id: string; text: string }>;

  @Column('simple-array')
  correctAnswers: string[]; // IDs das opções corretas

  @Column({ default: 1 })
  points: number;

  @Column({ default: 0 })
  order: number;
}
```

**QuizAttempt Entity**:
```typescript
@Entity('quiz_attempts')
export class QuizAttempt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  quizId: string;

  @Column()
  userId: string;

  @Column('jsonb')
  answers: Array<{ questionId: string; answer: string[] }>;

  @Column({ default: 0 })
  score: number;

  @Column({ default: false })
  passed: boolean;

  @Column({ nullable: true })
  startedAt: Date;

  @Column({ nullable: true })
  completedAt: Date;
}
```

---

### 2.2. Backend - Lógica de Correção
**Prioridade**: 🟡 ALTA
**Tempo estimado**: 3 dias

- [ ] QuizzesService
  - [ ] submitQuiz(attemptId, answers)
  - [ ] gradeQuiz(attemptId)
  - [ ] getAttempts(userId, quizId)
  - [ ] canRetake(userId, quizId)
- [ ] Lógica de pontuação
- [ ] Verificação de limite de tentativas
- [ ] Atualizar progresso de lição ao passar no quiz

---

### 2.3. Frontend - Interface de Quiz
**Prioridade**: 🟡 ALTA
**Tempo estimado**: 4 dias

- [ ] Criar página de quiz
  - [ ] Timer (se tiver limite de tempo)
  - [ ] Navegação entre questões
  - [ ] Marcação de questões
  - [ ] Botão "Finalizar"
- [ ] Página de resultado
  - [ ] Score
  - [ ] Gabarito (se configurado)
  - [ ] Feedback por questão
  - [ ] Botão "Tentar novamente"
- [ ] Editor de quiz (instrutor)
  - [ ] Criar questões
  - [ ] Definir respostas corretas
  - [ ] Configurar quiz

---

## 💬 Fase 3: Interação e Comunidade (2 semanas)

### 3.1. Sistema de Discussões
**Prioridade**: 🟡 MÉDIA
**Tempo estimado**: 5 dias

**Backend**:
- [ ] Criar entities: Discussion, Comment
- [ ] DiscussionsModule com CRUD
- [ ] Sistema de likes/upvotes
- [ ] Notificações de respostas

**Frontend**:
- [ ] Fórum do curso
- [ ] Criar tópico
- [ ] Comentar
- [ ] Like/Upvote

---

### 3.2. Sistema de Notificações
**Prioridade**: 🟡 MÉDIA
**Tempo estimado**: 5 dias

**Backend**:
- [ ] Criar NotificationEntity
- [ ] NotificationsService
- [ ] Tipos: novo curso, conquista, resposta, certificado
- [ ] WebSocket para real-time (opcional)
- [ ] Email transacional

**Frontend**:
- [ ] Sino de notificações no header
- [ ] Badge de contador
- [ ] Página de notificações
- [ ] Marcar como lida

---

## 📊 Fase 4: Analytics e Relatórios (1-2 semanas)

### 4.1. Analytics do Instrutor
**Prioridade**: 🟡 MÉDIA
**Tempo estimado**: 5 days

**Backend**:
- [ ] Endpoints de estatísticas
  - [ ] GET /api/courses/:id/stats
  - [ ] GET /api/courses/:id/analytics
  - [ ] GET /api/instructors/me/stats

**Frontend**:
- [ ] Dashboard do instrutor
- [ ] Gráficos de matrículas
- [ ] Taxa de conclusão
- [ ] Tempo médio
- [ ] Avaliações médias

---

### 4.2. Busca Avançada
**Prioridade**: 🟡 MÉDIA
**Tempo estimado**: 3 dias

- [ ] Busca full-text (PostgreSQL ou Elasticsearch)
- [ ] Filtros (categoria, dificuldade, duração)
- [ ] Autocomplete
- [ ] Ordenação (relevância, popularidade, novo)

---

## 🎨 Fase 5: Melhorias de UX (1-2 semanas)

### 5.1. Melhorias no Player
- [ ] Player de vídeo avançado (Video.js)
- [ ] Controle de velocidade
- [ ] Legendas
- [ ] Anotações/bookmarks
- [ ] Picture-in-picture

### 5.2. Acessibilidade
- [ ] ARIA labels
- [ ] Navegação por teclado
- [ ] Alto contraste
- [ ] Modo escuro

### 5.3. Mobile
- [ ] Design responsivo melhorado
- [ ] PWA
- [ ] Offline mode

---

## 🔐 Fase 6: Segurança e Performance (1 semana)

### 6.1. Segurança
- [ ] Helmet.js
- [ ] Rate limiting (@nestjs/throttler)
- [ ] CSRF protection
- [ ] Input sanitization
- [ ] Security headers

### 6.2. Performance
- [ ] Implementar cache Redis
- [ ] Query optimization
- [ ] Lazy loading
- [ ] CDN para assets
- [ ] Compression

### 6.3. Monitoring
- [ ] Winston/Pino logging
- [ ] Sentry error tracking
- [ ] Prometheus metrics
- [ ] Health checks avançados

---

## 📅 Timeline Resumido

| Fase | Duração | Entregas Principais |
|------|---------|---------------------|
| **Fase 0** | 1-2 semanas | DTOs, Swagger, Error Handling, Testes |
| **Fase 1** | 2-3 semanas | Módulos, Lições, Upload, Player |
| **Fase 2** | 2-3 semanas | Quizzes, Avaliações, Correção |
| **Fase 3** | 2 semanas | Discussões, Notificações |
| **Fase 4** | 1-2 semanas | Analytics, Busca |
| **Fase 5** | 1-2 semanas | UX, Mobile, PWA |
| **Fase 6** | 1 semana | Segurança, Performance, Monitoring |

**Total**: ~10-15 semanas (2,5-4 meses)

---

## 🎯 Priorização Sugerida

### Sprint 1-2 (Fundação)
1. DTOs e Validação
2. Swagger
3. Error Handling
4. Testes básicos

### Sprint 3-5 (Conteúdo)
1. Entidades Module/Lesson
2. CRUD de conteúdo
3. Upload de arquivos
4. Player de curso

### Sprint 6-8 (Avaliações)
1. Entidades Quiz
2. Lógica de correção
3. UI de quiz

### Sprint 9-10 (Comunidade)
1. Discussões
2. Notificações

### Sprint 11-12 (Analytics)
1. Dashboard instrutor
2. Busca avançada

### Sprint 13-14 (Polimento)
1. UX/UI melhorias
2. Mobile/PWA

### Sprint 15 (Produção)
1. Segurança
2. Performance
3. Monitoring

---

## 🚦 Decisões Técnicas Importantes

### Vídeos
**Opções**:
1. **Self-hosted**: Upload para S3 + CloudFront
2. **Vimeo/YouTube**: Embed
3. **Wistia/Mux**: Plataforma especializada

**Recomendação**: Começar com Vimeo/YouTube, migrar para S3+CloudFront depois

### Editor de Texto
**Opções**:
1. **Quill**: Simples, leve
2. **TipTap**: Moderno, extensível
3. **Draft.js**: Poderoso, complexo

**Recomendação**: TipTap

### Real-time
**Opções**:
1. **WebSockets** (Socket.io)
2. **Server-Sent Events** (SSE)
3. **Polling**

**Recomendação**: Socket.io para notificações

---

## 📝 Próximos Passos Imediatos

1. **Escolher qual fase começar** (recomendo Fase 0)
2. **Criar branch de desenvolvimento**
3. **Setup de ambiente de staging**
4. **Definir critérios de aceitação** para cada feature
5. **Começar com DTOs** (quick win, base sólida)

---

**Pronto para começar?** Qual fase você quer priorizar?
