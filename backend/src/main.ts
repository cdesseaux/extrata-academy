import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/exceptions';
import { join } from 'path';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Configurar Helmet para segurança
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://keycloak-hlg.extrata.com.br"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  // Define prefixo global da API
  app.setGlobalPrefix('api');

  // Configurar ValidationPipe global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove propriedades não definidas nos DTOs
      forbidNonWhitelisted: true, // Lança erro se houver propriedades não permitidas
      transform: true, // Transforma payloads em instâncias de DTOs
      transformOptions: {
        enableImplicitConversion: true, // Converte tipos automaticamente
      },
    }),
  );

  // Configurar GlobalExceptionFilter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Habilita CORS para o frontend local e externo
  app.enableCors({
    origin: [
      /^http:\/\/localhost:\d+$/,
      /^https?:\/\/.*\.extrata\.com\.br$/,
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Authorization'],
  });

  // Serve static files (certificates)
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // Configurar Swagger
  const config = new DocumentBuilder()
    .setTitle('Extrata Academy API')
    .setDescription('API documentation for Extrata Academy LMS')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token from Keycloak',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Users', 'User management')
    .addTag('Courses', 'Course management')
    .addTag('Modules', 'Module management')
    .addTag('Lessons', 'Lesson management')
    .addTag('Enrollments', 'Enrollment management')
    .addTag('Certificates', 'Certificate management')
    .addTag('Gamification', 'Gamification features')
    .addTag('Files', 'File upload and management')
    .addTag('Quizzes', 'Quiz and assessment management')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  await app.listen(process.env.PORT ?? 4000);
  console.log(`🚀 Backend rodando em http://localhost:${process.env.PORT ?? 4000}/api`);
  console.log(`📚 Documentação Swagger: http://localhost:${process.env.PORT ?? 4000}/api/docs`);
}
bootstrap();
