import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { LearningPathsService } from '../learning-paths/learning-paths.service';

async function seedLearningPaths() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const learningPathsService = app.get(LearningPathsService);

  const sampleLearningPaths = [
    {
      title: 'Trilha de Gestão de Processos',
      slug: 'gestao-processos',
      description: 'Aprenda a gerenciar processos de forma eficiente no sistema Extrata. Esta trilha abrange desde conceitos básicos até técnicas avançadas de otimização de processos.',
      targetRole: 'gestor',
      estimatedHours: 12.5,
      isFeatured: true,
      orderIndex: 1,
    },
    {
      title: 'Trilha de Auditoria e Compliance',
      slug: 'auditoria-compliance',
      description: 'Domine as práticas de auditoria e compliance no ambiente corporativo. Inclui frameworks, metodologias e ferramentas essenciais para auditores.',
      targetRole: 'auditor',
      estimatedHours: 15.0,
      isFeatured: true,
      orderIndex: 2,
    },
    {
      title: 'Trilha Técnica Avançada',
      slug: 'tecnica-avancada',
      description: 'Para profissionais técnicos que desejam aprofundar seus conhecimentos em sistemas e integrações avançadas.',
      targetRole: 'tecnico',
      estimatedHours: 20.0,
      isFeatured: false,
      orderIndex: 3,
    },
    {
      title: 'Trilha de Liderança',
      slug: 'lideranca',
      description: 'Desenvolva habilidades de liderança e gestão de equipes. Aborda comunicação, motivação e estratégias de desenvolvimento de pessoas.',
      targetRole: 'lider',
      estimatedHours: 18.0,
      isFeatured: true,
      orderIndex: 4,
    }
  ];

  console.log('🌱 Iniciando seed de learning paths...');

  for (const pathData of sampleLearningPaths) {
    try {
      const existingPaths = await learningPathsService.findAll();
      const pathExists = existingPaths.some(path => path.slug === pathData.slug);
      
      if (!pathExists) {
        const learningPath = await learningPathsService.create(pathData);
        console.log(`✅ Learning Path criado: ${learningPath.title}`);
      } else {
        console.log(`⏭️  Learning Path já existe: ${pathData.title}`);
      }
    } catch (error) {
      console.error(`❌ Erro ao criar learning path "${pathData.title}":`, error);
    }
  }

  console.log('🎉 Seed de learning paths concluído!');
  await app.close();
}

seedLearningPaths().catch(console.error);
