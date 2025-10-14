import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { CoursesService } from '../courses/courses.service';

async function seedCourses() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const coursesService = app.get(CoursesService);

  const sampleCourses = [
    {
      title: 'Introdução ao Sistema Extrata',
      description: 'Aprenda os conceitos básicos e fundamentais do sistema Extrata. Este curso abrange a navegação, funcionalidades principais e boas práticas para usuários iniciantes.',
    },
    {
      title: 'Gestão de Processos no Extrata',
      description: 'Domine as funcionalidades avançadas de gestão de processos no sistema Extrata. Inclui criação de workflows, aprovações e monitoramento de processos.',
    },
    {
      title: 'Relatórios e Analytics',
      description: 'Aprenda a gerar e interpretar relatórios no sistema Extrata. Inclui dashboards personalizados, métricas de performance e análise de dados.',
    },
    {
      title: 'Configurações Avançadas',
      description: 'Curso avançado para administradores do sistema. Aborda configurações de segurança, integrações, backups e manutenção do sistema.',
    },
    {
      title: 'Extrata Mobile',
      description: 'Aprenda a usar o aplicativo móvel do Extrata. Inclui sincronização offline, notificações push e funcionalidades específicas para dispositivos móveis.',
    }
  ];

  console.log('🌱 Iniciando seed de cursos...');

  for (const courseData of sampleCourses) {
    try {
      const existingCourse = await coursesService.findAll();
      const courseExists = existingCourse.some(course => course.title === courseData.title);
      
      if (!courseExists) {
        const course = await coursesService.create(courseData);
        console.log(`✅ Curso criado: ${course.title}`);
      } else {
        console.log(`⏭️  Curso já existe: ${courseData.title}`);
      }
    } catch (error) {
      console.error(`❌ Erro ao criar curso "${courseData.title}":`, error);
    }
  }

  console.log('🎉 Seed de cursos concluído!');
  await app.close();
}

seedCourses().catch(console.error);










