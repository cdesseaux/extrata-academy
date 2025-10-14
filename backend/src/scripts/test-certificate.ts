import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { CertificatesService } from '../certificates/certificates.service';
import { UsersService } from '../users/users.service';
import { CoursesService } from '../courses/courses.service';
import { INestApplicationContext } from '@nestjs/common';

async function bootstrap() {
  let app: INestApplicationContext | undefined;
  try {
    app = await NestFactory.createApplicationContext(AppModule);
    const certificatesService = app.get(CertificatesService);
    const usersService = app.get(UsersService);
    const coursesService = app.get(CoursesService);

    console.log('📜 Testando geração de certificados...');

    // Buscar um usuário e curso existentes
    const users = await usersService.findAll();
    const courses = await coursesService.findAll();

    if (users.length === 0 || courses.length === 0) {
      console.log('❌ Nenhum usuário ou curso encontrado. Execute o seed primeiro.');
      return;
    }

    const user = users[0];
    const course = courses[0];

    console.log(`👤 Usuário: ${user.firstName} ${user.lastName}`);
    console.log(`📚 Curso: ${course.title}`);

    // Gerar certificado de teste
    const certificate = await certificatesService.createCertificate(
      user.id,
      course.id,
      new Date(),
    );

    console.log('✅ Certificado gerado com sucesso!');
    console.log(`📄 Número: ${certificate.certificateNumber}`);
    console.log(`🔗 URL: ${certificate.certificateUrl}`);

  } catch (error) {
    console.error('❌ Erro ao testar certificado:', error);
  } finally {
    await app?.close();
  }
}

bootstrap();









