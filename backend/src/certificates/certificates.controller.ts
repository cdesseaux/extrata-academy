import { Controller, Get, Post, Body, Param, UseGuards, Request, Res } from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';

@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Get('my-certificates')
  @UseGuards(JwtAuthGuard)
  async getMyCertificates(@Request() req: any) {
    return this.certificatesService.getUserCertificates(req.user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getCertificate(@Param('id') id: string) {
    return this.certificatesService.getCertificateById(id);
  }

  @Get('validate/:certificateNumber')
  async validateCertificate(@Param('certificateNumber') certificateNumber: string) {
    const certificate = await this.certificatesService.validateCertificate(certificateNumber);
    
    if (!certificate) {
      return {
        valid: false,
        message: 'Certificado não encontrado ou inválido',
      };
    }

    return {
      valid: true,
      certificate: {
        id: certificate.id,
        certificateNumber: certificate.certificateNumber,
        studentName: certificate.studentName,
        courseTitle: certificate.title,
        completionDate: certificate.completionDate,
        issuedAt: certificate.createdAt,
      },
    };
  }

  @Get('download/:certificateNumber')
  async downloadCertificate(
    @Param('certificateNumber') certificateNumber: string,
    @Res() res: Response,
  ) {
    const certificate = await this.certificatesService.validateCertificate(certificateNumber);
    
    if (!certificate || !certificate.certificateUrl) {
      return res.status(404).json({ message: 'Certificado não encontrado' });
    }

    const filePath = path.join(process.cwd(), certificate.certificateUrl);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Arquivo do certificado não encontrado' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="certificado-${certificate.certificateNumber}.pdf"`);
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  }

  @Post('generate')
  @UseGuards(JwtAuthGuard)
  async generateCertificate(
    @Request() req: any,
    @Body() body: { courseId: string; completionDate?: string },
  ) {
    const completionDate = body.completionDate ? new Date(body.completionDate) : new Date();
    
    return this.certificatesService.createCertificate(
      req.user.id,
      body.courseId,
      completionDate,
    );
  }
}
