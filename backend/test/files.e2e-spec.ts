import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { File } from '../src/files/entities/file.entity';
import { Repository } from 'typeorm';

describe('Files (e2e)', () => {
  let app: INestApplication;
  let filesRepository: Repository<File>;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    filesRepository = moduleFixture.get<Repository<File>>(getRepositoryToken(File));

    // Mock authentication token (você precisa ajustar isso baseado no seu sistema de auth)
    authToken = 'mock-jwt-token'; // Em produção, você geraria um token válido aqui
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    // Limpar arquivos de teste após cada teste
    await filesRepository.delete({});
  });

  describe('/api/files/upload/pdf (POST)', () => {
    it('should upload PDF file successfully', () => {
      return request(app.getHttpServer())
        .post('/api/files/upload/pdf')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', Buffer.from('test pdf content'), {
          filename: 'test.pdf',
          contentType: 'application/pdf',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('originalName', 'test.pdf');
          expect(res.body).toHaveProperty('mimetype', 'application/pdf');
          expect(res.body).toHaveProperty('type', 'pdf');
          expect(res.body).toHaveProperty('url');
          expect(res.body.url).toContain('s3.amazonaws.com');
        });
    });

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .post('/api/files/upload/pdf')
        .attach('file', Buffer.from('test pdf content'), {
          filename: 'test.pdf',
          contentType: 'application/pdf',
        })
        .expect(401);
    });

    it('should return 400 if no file provided', () => {
      return request(app.getHttpServer())
        .post('/api/files/upload/pdf')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    it('should return 400 if file is too large', () => {
      const largeBuffer = Buffer.alloc(60 * 1024 * 1024); // 60MB (maior que limite de 50MB)

      return request(app.getHttpServer())
        .post('/api/files/upload/pdf')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', largeBuffer, {
          filename: 'large.pdf',
          contentType: 'application/pdf',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('muito grande');
        });
    });
  });

  describe('/api/files/upload/video (POST)', () => {
    it('should upload video file successfully', () => {
      return request(app.getHttpServer())
        .post('/api/files/upload/video')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', Buffer.from('test video content'), {
          filename: 'test.mp4',
          contentType: 'video/mp4',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('type', 'video');
          expect(res.body).toHaveProperty('mimetype', 'video/mp4');
          expect(res.body.url).toContain('videos/');
        });
    });
  });

  describe('/api/files/upload/image (POST)', () => {
    it('should upload image file successfully', () => {
      return request(app.getHttpServer())
        .post('/api/files/upload/image')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', Buffer.from('test image content'), {
          filename: 'test.jpg',
          contentType: 'image/jpeg',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('type', 'image');
          expect(res.body).toHaveProperty('mimetype', 'image/jpeg');
          expect(res.body.url).toContain('images/');
        });
    });
  });

  describe('/api/files (GET)', () => {
    it('should return all files for authenticated user', async () => {
      // Primeiro, upload alguns arquivos
      await request(app.getHttpServer())
        .post('/api/files/upload/pdf')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', Buffer.from('test1'), {
          filename: 'test1.pdf',
          contentType: 'application/pdf',
        });

      await request(app.getHttpServer())
        .post('/api/files/upload/pdf')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', Buffer.from('test2'), {
          filename: 'test2.pdf',
          contentType: 'application/pdf',
        });

      // Agora busque todos os arquivos
      return request(app.getHttpServer())
        .get('/api/files')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThanOrEqual(2);
        });
    });

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .get('/api/files')
        .expect(401);
    });
  });

  describe('/api/files/:id (GET)', () => {
    it('should return file by id', async () => {
      // Upload um arquivo primeiro
      const uploadResponse = await request(app.getHttpServer())
        .post('/api/files/upload/pdf')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', Buffer.from('test'), {
          filename: 'test.pdf',
          contentType: 'application/pdf',
        });

      const fileId = uploadResponse.body.id;

      // Busque o arquivo por ID
      return request(app.getHttpServer())
        .get(`/api/files/${fileId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', fileId);
          expect(res.body).toHaveProperty('originalName', 'test.pdf');
        });
    });
  });

  describe('/api/files/:id/url (GET)', () => {
    it('should return presigned URL for file', async () => {
      // Upload um arquivo primeiro
      const uploadResponse = await request(app.getHttpServer())
        .post('/api/files/upload/pdf')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', Buffer.from('test'), {
          filename: 'test.pdf',
          contentType: 'application/pdf',
        });

      const fileId = uploadResponse.body.id;

      // Busque presigned URL
      return request(app.getHttpServer())
        .get(`/api/files/${fileId}/url`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('url');
          expect(res.body).toHaveProperty('expiresIn', 3600);
          expect(res.body.url).toContain('s3.amazonaws.com');
          // Presigned URLs contém parâmetros de assinatura
          expect(res.body.url).toContain('X-Amz');
        });
    });

    it('should return 401 without authentication', async () => {
      return request(app.getHttpServer())
        .get('/api/files/some-id/url')
        .expect(401);
    });

    it('should return 404 for non-existent file', async () => {
      return request(app.getHttpServer())
        .get('/api/files/non-existent-id/url')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('/api/files/:id (DELETE)', () => {
    it('should soft delete file', async () => {
      // Upload um arquivo primeiro
      const uploadResponse = await request(app.getHttpServer())
        .post('/api/files/upload/pdf')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', Buffer.from('test'), {
          filename: 'test.pdf',
          contentType: 'application/pdf',
        });

      const fileId = uploadResponse.body.id;

      // Delete o arquivo
      await request(app.getHttpServer())
        .delete(`/api/files/${fileId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Verificar que o arquivo não aparece mais
      const file = await filesRepository.findOne({
        where: { id: fileId, isActive: true },
      });
      expect(file).toBeNull();
    });
  });

  describe('File Upload Flow (Integration)', () => {
    it('should complete full upload and access flow', async () => {
      // 1. Upload arquivo
      const uploadResponse = await request(app.getHttpServer())
        .post('/api/files/upload/pdf')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', Buffer.from('test content'), {
          filename: 'integration-test.pdf',
          contentType: 'application/pdf',
        })
        .expect(201);

      const fileId = uploadResponse.body.id;
      expect(fileId).toBeDefined();

      // 2. Buscar arquivo por ID
      await request(app.getHttpServer())
        .get(`/api/files/${fileId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // 3. Gerar presigned URL
      const urlResponse = await request(app.getHttpServer())
        .get(`/api/files/${fileId}/url`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(urlResponse.body.url).toBeDefined();
      expect(urlResponse.body.expiresIn).toBe(3600);

      // 4. Verificar que arquivo aparece na lista
      const listResponse = await request(app.getHttpServer())
        .get('/api/files')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const uploadedFile = listResponse.body.find((f: any) => f.id === fileId);
      expect(uploadedFile).toBeDefined();

      // 5. Deletar arquivo
      await request(app.getHttpServer())
        .delete(`/api/files/${fileId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // 6. Verificar que arquivo não aparece mais na busca
      const file = await filesRepository.findOne({
        where: { id: fileId, isActive: true },
      });
      expect(file).toBeNull();
    });
  });
});
