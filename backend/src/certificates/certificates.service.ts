import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certificate } from './entities/certificate.entity';
import { UsersService } from '../users/users.service';
import { CoursesService } from '../courses/courses.service';
import PDFDocument from 'pdfkit';
import * as QRCode from 'qrcode';

@Injectable()
export class CertificatesService {
  constructor(
    @InjectRepository(Certificate)
    private certificatesRepository: Repository<Certificate>,
    private usersService: UsersService,
    private coursesService: CoursesService,
  ) {}

  async createCertificate(
    userId: string,
    courseId: string,
    completionDate: Date,
  ): Promise<Certificate> {
    // Verificar se já existe certificado para este curso
    const existingCertificate = await this.certificatesRepository.findOne({
      where: { userId, courseId },
    });

    if (existingCertificate) {
      return existingCertificate;
    }

    // Buscar dados do usuário e curso
    const user = await this.usersService.findOne(userId);
    const course = await this.coursesService.findOne(courseId);

    if (!user || !course) {
      throw new Error('Usuário ou curso não encontrado');
    }

    // Gerar número único do certificado
    const certificateNumber = this.generateCertificateNumber();

    // Criar certificado
    const certificate = this.certificatesRepository.create({
      userId,
      courseId,
      certificateNumber,
      title: course.title,
      studentName: `${user.firstName} ${user.lastName}`.trim() || user.username,
      completionDate,
      metadata: {
        courseTitle: course.title,
        studentEmail: user.email,
        completionDate: completionDate.toISOString(),
      },
    });

    const savedCertificate = await this.certificatesRepository.save(certificate);

    // Gerar PDF do certificado
    const pdfUrl = await this.generateCertificatePDF(savedCertificate);
    savedCertificate.certificateUrl = pdfUrl;
    
    return this.certificatesRepository.save(savedCertificate);
  }

  async getUserCertificates(userId: string): Promise<Certificate[]> {
    return this.certificatesRepository.find({
      where: { userId, isActive: true },
      relations: ['course'],
      order: { completionDate: 'DESC' },
    });
  }

  async getCertificateById(id: string): Promise<Certificate | null> {
    return this.certificatesRepository.findOne({
      where: { id, isActive: true },
      relations: ['user', 'course'],
    });
  }

  async validateCertificate(certificateNumber: string): Promise<Certificate | null> {
    return this.certificatesRepository.findOne({
      where: { certificateNumber, isActive: true },
      relations: ['user', 'course'],
    });
  }

  private generateCertificateNumber(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `EXT-${timestamp}-${random}`.toUpperCase();
  }

  private async generateCertificatePDF(certificate: Certificate): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          layout: 'landscape',
          margins: {
            top: 50,
            bottom: 50,
            left: 50,
            right: 50,
          },
        });

        // Configurar fontes
        doc.registerFont('regular', 'Helvetica');
        doc.registerFont('bold', 'Helvetica-Bold');

        // Background gradient
        const gradient = doc.linearGradient(0, 0, 842, 595);
        gradient.stop(0, '#f8fafc')
              .stop(1, '#e2e8f0');
        doc.rect(0, 0, 842, 595).fill(gradient);

        // Header
        doc.fontSize(36)
           .font('bold')
           .fillColor('#1e40af')
           .text('EXTRATA ACADEMY', 50, 80, { align: 'center' });

        doc.fontSize(20)
           .font('regular')
           .fillColor('#64748b')
           .text('Certificado de Conclusão', 50, 130, { align: 'center' });

        // Linha decorativa
        doc.strokeColor('#3b82f6')
           .lineWidth(3)
           .moveTo(200, 180)
           .lineTo(642, 180)
           .stroke();

        // Conteúdo principal
        doc.fontSize(24)
           .font('regular')
           .fillColor('#1f2937')
           .text('Certificamos que', 50, 220, { align: 'center' });

        doc.fontSize(32)
           .font('bold')
           .fillColor('#1e40af')
           .text(certificate.studentName, 50, 260, { align: 'center' });

        doc.fontSize(20)
           .font('regular')
           .fillColor('#1f2937')
           .text('concluiu com sucesso o curso', 50, 320, { align: 'center' });

        doc.fontSize(28)
           .font('bold')
           .fillColor('#059669')
           .text(certificate.title, 50, 360, { align: 'center' });

        doc.fontSize(16)
           .font('regular')
           .fillColor('#6b7280')
           .text(`Concluído em ${certificate.completionDate.toLocaleDateString('pt-BR')}`, 50, 420, { align: 'center' });

        // QR Code
        const qrData = {
          certificateNumber: certificate.certificateNumber,
          studentName: certificate.studentName,
          courseTitle: certificate.title,
          completionDate: certificate.completionDate.toISOString(),
          validationUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/certificates/validate/${certificate.certificateNumber}`,
        };

        const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
          width: 120,
          margin: 2,
          color: {
            dark: '#1e40af',
            light: '#ffffff',
          },
        });

        // Adicionar QR Code
        doc.image(qrCodeDataURL, 50, 480, { width: 120, height: 120 });

        // Informações do certificado
        doc.fontSize(10)
           .font('regular')
           .fillColor('#9ca3af')
           .text(`Certificado Nº: ${certificate.certificateNumber}`, 200, 480)
           .text('Este certificado pode ser verificado online', 200, 500)
           .text('através do código QR ou número do certificado.', 200, 515);

        // Footer
        doc.fontSize(12)
           .font('regular')
           .fillColor('#6b7280')
           .text('Extrata Academy - Plataforma de Aprendizado Online', 50, 550, { align: 'center' })
           .text('www.extrata.com.br/academy', 50, 570, { align: 'center' });

        // Salvar PDF
        const fileName = `certificate-${certificate.certificateNumber}.pdf`;
        const filePath = `./uploads/certificates/${fileName}`;
        
        // Criar diretório se não existir
        const fs = require('fs');
        const path = require('path');
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        doc.pipe(fs.createWriteStream(filePath));
        doc.end();

        doc.on('end', () => {
          const publicUrl = `/uploads/certificates/${fileName}`;
          resolve(publicUrl);
        });

        doc.on('error', (error: any) => {
          reject(error);
        });

      } catch (error) {
        reject(error);
      }
    });
  }
}
