import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnrollmentsService } from './enrollments.service';
import { EnrollmentsController } from './enrollments.controller';
import { Enrollment } from './entities/enrollment.entity';
import { GamificationModule } from '../gamification/gamification.module';
import { CertificatesModule } from '../certificates/certificates.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Enrollment]),
    GamificationModule,
    CertificatesModule,
  ],
  controllers: [EnrollmentsController],
  providers: [EnrollmentsService],
  exports: [EnrollmentsService],
})
export class EnrollmentsModule {}

