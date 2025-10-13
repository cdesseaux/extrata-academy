/**
 * Database Seed Script
 * 
 * Este script popula o banco de dados com dados iniciais para desenvolvimento.
 * 
 * Run: npm run seed
 */

import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as bcrypt from 'bcrypt';

// Load environment variables
config();

// Entities (adjust imports based on your structure)
import { User } from '../src/users/entities/user.entity';
import { Course } from '../src/courses/entities/course.entity';
import { Module } from '../src/courses/entities/module.entity';
import { Lesson } from '../src/courses/entities/lesson.entity';
import { Achievement } from '../src/gamification/entities/achievement.entity';

// ============================================
// DATA SOURCE SETUP
// ============================================

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || 'academy',
  password: process.env.DB_PASSWORD || 'academy123',
  database: process.env.DB_NAME || 'academy',
  entities: [User, Course, Module, Lesson, Achievement],
  synchronize: false,
});

// ============================================
// SEED DATA
// ============================================

const seedUsers = async (dataSource: DataSource) => {
  console.log('🌱 Seeding users...');
  
  const usersRepo = dataSource.getRepository(User);

  const users = [
    {
      keycloak_id: 'admin-keycloak-id',
      email: 'admin@extrata.gov.br',
      name: 'Admin Extrata',
      role: 'ADMIN',
      is_active: true,
    },
    {
      keycloak_id: 'instructor-keycloak-id',
      email: 'instructor@extrata.gov.br',
      name: 'Professor Silva',
      role: 'INSTRUCTOR',
      is_active: true,
    },
    {
      keycloak_id: 'student1-keycloak-id',
      email: 'joao.silva@municipio.gov.br',
      name: 'João Silva',
      role: 'STUDENT',
      municipality_id: 'municipio-sp-1',
      is_active: true,
    },
    {
      keycloak_id: 'student2-keycloak-id',
      email: 'maria.santos@municipio.gov.br',
      name: 'Maria Santos',
      role: 'STUDENT',
      municipality_id: 'municipio-rj-1',
      is_active: true,
    },
    {
      keycloak_id: 'auditor-keycloak-id',
      email: 'auditor@extrata.gov.br',
      name: 'Carlos Auditor',
      role: 'AUDITOR',
      is_active: true,
    },
  ];

  for (const userData of users) {
    const exists = await usersRepo.findOne({ 
      where: { email: userData.email } 
    });

    if (!exists) {
      const user = usersRepo.create(userData);
      await usersRepo.save(user);
      console.log(`  ✓ Created user: ${user.email}`);
    } else {
      console.log(`  ⊘ User already exists: ${userData.email}`);
    }
  }

  console.log('✅ Users seeded\n');
};

const seedCourses = async (dataSource: DataSource) => {
  console.log('🌱 Seeding courses...');
  
  const coursesRepo = dataSource.getRepository(Course);
  const modulesRepo = dataSource.getRepository(Module);
  const lessonsRepo = dataSource.getRepository(Lesson);

  // Course 1: Introdução ao Extrata
  let course1 = await coursesRepo.findOne({ 
    where: { slug: 'introducao-ao-extrata' } 
  });

  if (!course1) {
    course1 = coursesRepo.create({
      title: 'Introdução ao Extrata',
      slug: 'introducao-ao-extrata',
      description: 'Aprenda os conceitos fundamentais do sistema Extrata e como utilizá-lo para captação de recursos federais.',
      category: 'Fundamentos',
      difficulty_level: 'iniciante',
      estimated_hours: 2.5,
      thumbnail_url: '/images/courses/intro-extrata.jpg',
      status: 'published',
      is_featured: true,
      order_index: 1,
    });
    await coursesRepo.save(course1);
    console.log(`  ✓ Created course: ${course1.title}`);

    // Módulo 1
    const module1 = modulesRepo.create({
      course_id: course1.id,
      title: 'Primeiros Passos',
      description: 'Comece sua jornada no Extrata',
      order_index: 0,
      duration_minutes: 45,
    });
    await modulesRepo.save(module1);

    // Lições do Módulo 1
    const lessons1 = [
      {
        module_id: module1.id,
        title: 'Bem-vindo ao Extrata',
        description: 'Conheça o sistema e seus benefícios',
        content_type: 'video',
        content: {
          video_url: 'https://example.com/videos/welcome.mp4',
          duration: 600,
          thumbnail: '/images/lessons/welcome-thumb.jpg',
        },
        order_index: 0,
        duration_minutes: 10,
        is_mandatory: true,
        is_preview: true,
      },
      {
        module_id: module1.id,
        title: 'Navegação Básica',
        description: 'Aprenda a navegar pelo sistema',
        content_type: 'video',
        content: {
          video_url: 'https://example.com/videos/navigation.mp4',
          duration: 900,
        },
        order_index: 1,
        duration_minutes: 15,
        is_mandatory: true,
      },
      {
        module_id: module1.id,
        title: 'Quiz: Primeiros Passos',
        description: 'Teste seus conhecimentos',
        content_type: 'quiz',
        content: {
          quiz_id: 'to-be-created',
        },
        order_index: 2,
        duration_minutes: 20,
        is_mandatory: true,
      },
    ];

    for (const lessonData of lessons1) {
      const lesson = lessonsRepo.create(lessonData);
      await lessonsRepo.save(lesson);
    }

    console.log(`  ✓ Created ${lessons1.length} lessons for module: ${module1.title}`);
  } else {
    console.log(`  ⊘ Course already exists: ${course1.title}`);
  }

  // Course 2: IA Nexia Avançado
  let course2 = await coursesRepo.findOne({ 
    where: { slug: 'ia-nexia-avancado' } 
  });

  if (!course2) {
    course2 = coursesRepo.create({
      title: 'IA Nexia Avançado',
      slug: 'ia-nexia-avancado',
      description: 'Domine a inteligência artificial do Extrata e maximize seus resultados na captação de recursos.',
      category: 'Avançado',
      difficulty_level: 'avancado',
      estimated_hours: 5,
      thumbnail_url: '/images/courses/ia-nexia.jpg',
      status: 'published',
      is_featured: true,
      order_index: 2,
    });
    await coursesRepo.save(course2);
    console.log(`  ✓ Created course: ${course2.title}`);

    // Módulo 1
    const module1 = modulesRepo.create({
      course_id: course2.id,
      title: 'Fundamentos da IA Nexia',
      description: 'Entenda como a IA funciona',
      order_index: 0,
      duration_minutes: 90,
    });
    await modulesRepo.save(module1);

    const lessons = [
      {
        module_id: module1.id,
        title: 'Como a IA Analisa Oportunidades',
        content_type: 'video',
        content: {
          video_url: 'https://example.com/videos/ia-intro.mp4',
          duration: 1200,
        },
        order_index: 0,
        duration_minutes: 20,
        is_mandatory: true,
      },
      {
        module_id: module1.id,
        title: 'Interpretando Relatórios da IA',
        content_type: 'text',
        content: {
          html: '<h1>Relatórios da IA</h1><p>A IA Nexia gera 7 tipos de relatórios...</p>',
          reading_time: 15,
        },
        order_index: 1,
        duration_minutes: 15,
        is_mandatory: true,
      },
    ];

    for (const lessonData of lessons) {
      const lesson = lessonsRepo.create(lessonData);
      await lessonsRepo.save(lesson);
    }

    console.log(`  ✓ Created ${lessons.length} lessons for module: ${module1.title}`);
  } else {
    console.log(`  ⊘ Course already exists: ${course2.title}`);
  }

  // Course 3: Gestão de Propostas
  let course3 = await coursesRepo.findOne({ 
    where: { slug: 'gestao-de-propostas' } 
  });

  if (!course3) {
    course3 = coursesRepo.create({
      title: 'Gestão de Propostas',
      slug: 'gestao-de-propostas',
      description: 'Aprenda a criar, monitorar e gerenciar propostas de forma eficiente.',
      category: 'Intermediário',
      difficulty_level: 'intermediario',
      estimated_hours: 4,
      thumbnail_url: '/images/courses/propostas.jpg',
      status: 'published',
      order_index: 3,
    });
    await coursesRepo.save(course3);
    console.log(`  ✓ Created course: ${course3.title}`);
  } else {
    console.log(`  ⊘ Course already exists: ${course3.title}`);
  }

  console.log('✅ Courses seeded\n');
};

const seedAchievements = async (dataSource: DataSource) => {
  console.log('🌱 Seeding achievements...');
  
  const achievementsRepo = dataSource.getRepository(Achievement);

  const achievements = [
    {
      code: 'first_course',
      name: 'Primeira Conquista',
      description: 'Complete seu primeiro curso',
      icon: '🎯',
      category: 'milestone',
      is_active: true,
    },
    {
      code: 'ia_master',
      name: 'Mestre da IA',
      description: 'Complete todos os cursos sobre IA Nexia',
      icon: '🤖',
      category: 'skill',
      is_active: true,
    },
    {
      code: 'speed_runner',
      name: 'Velocista',
      description: 'Complete um curso em menos de 24 horas',
      icon: '⚡',
      category: 'challenge',
      is_active: true,
    },
    {
      code: 'mentor',
      name: 'Mentor',
      description: 'Ajude 10 colegas na comunidade',
      icon: '🎓',
      category: 'social',
      points_required: 10,
      is_active: true,
    },
    {
      code: 'top_10',
      name: 'Top 10',
      description: 'Entre no top 10 do leaderboard',
      icon: '🏆',
      category: 'achievement',
      is_active: true,
    },
    {
      code: 'perfect_score',
      name: 'Nota Perfeita',
      description: 'Obtenha 100% em um quiz',
      icon: '💯',
      category: 'achievement',
      is_active: true,
    },
    {
      code: 'week_streak',
      name: 'Semana Completa',
      description: 'Estude por 7 dias consecutivos',
      icon: '🔥',
      category: 'streak',
      is_active: true,
    },
    {
      code: 'certified',
      name: 'Certificado',
      description: 'Obtenha seu primeiro certificado',
      icon: '📜',
      category: 'milestone',
      is_active: true,
    },
  ];

  for (const achievementData of achievements) {
    const exists = await achievementsRepo.findOne({ 
      where: { code: achievementData.code } 
    });

    if (!exists) {
      const achievement = achievementsRepo.create(achievementData);
      await achievementsRepo.save(achievement);
      console.log(`  ✓ Created achievement: ${achievement.name}`);
    } else {
      console.log(`  ⊘ Achievement already exists: ${achievementData.name}`);
    }
  }

  console.log('✅ Achievements seeded\n');
};

// ============================================
// MAIN SEED FUNCTION
// ============================================

async function seed() {
  console.log('🌱 Starting database seed...\n');

  try {
    // Initialize data source
    await AppDataSource.initialize();
    console.log('✅ Database connection established\n');

    // Run seeders
    await seedUsers(AppDataSource);
    await seedCourses(AppDataSource);
    await seedAchievements(AppDataSource);

    console.log('🎉 Seed completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    // Close connection
    await AppDataSource.destroy();
    console.log('✅ Database connection closed');
  }
}

// Run seed
seed();
