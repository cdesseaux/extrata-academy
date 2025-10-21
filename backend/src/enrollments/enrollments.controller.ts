import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, UseInterceptors } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { HttpCacheInterceptor } from '../common/interceptors/cache.interceptor';
import { CacheService } from '../common/services/cache.service';

@Controller('enrollments')
export class EnrollmentsController {
  constructor(
    private readonly enrollmentsService: EnrollmentsService,
    private readonly cacheService: CacheService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createEnrollmentDto: any, @Request() req: any) {
    console.log('Criando matrícula:', createEnrollmentDto, 'para usuário:', req.user);
    const enrollment = await this.enrollmentsService.create({
      ...createEnrollmentDto,
      userId: req.user.id,
    });

    // Invalidate enrollment caches
    await this.cacheService.invalidateEnrollment(req.user.id, createEnrollmentDto.courseId);

    return enrollment;
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(HttpCacheInterceptor)
  findAll() {
    return this.enrollmentsService.findAll();
  }

  @Get('my-enrollments')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(HttpCacheInterceptor)
  findMyEnrollments(@Request() req: any) {
    return this.enrollmentsService.findByUser(req.user.id);
  }

  @Get('my-enrollments-dev')
  findMyEnrollmentsDev() {
    // Rota temporária para desenvolvimento - retorna array vazio
    return [];
  }

  @Get('course/:courseId')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(HttpCacheInterceptor)
  findByCourse(@Param('courseId') courseId: string) {
    return this.enrollmentsService.findByCourse(courseId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(HttpCacheInterceptor)
  findOne(@Param('id') id: string) {
    return this.enrollmentsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() updateEnrollmentDto: any, @Request() req: any) {
    const enrollment = await this.enrollmentsService.update(id, updateEnrollmentDto);

    // Invalidate enrollment caches
    await this.cacheService.invalidateEnrollment(req.user.id);
    await this.cacheService.del(`http:/api/enrollments/${id}`);

    return enrollment;
  }

  @Patch(':id/progress')
  @UseGuards(JwtAuthGuard)
  async updateProgress(@Param('id') id: string, @Body() body: { progress: number }, @Request() req: any) {
    const enrollment = await this.enrollmentsService.updateProgress(id, body.progress);

    // Invalidate enrollment caches
    await this.cacheService.invalidateEnrollment(req.user.id);
    await this.cacheService.del(`http:/api/enrollments/${id}`);

    return enrollment;
  }

  @Patch(':id/calculate-progress')
  @UseGuards(JwtAuthGuard)
  async calculateProgress(@Param('id') id: string, @Request() req: any) {
    const enrollment = await this.enrollmentsService.calculateProgressFromLessons(id);

    // Invalidate enrollment caches
    await this.cacheService.invalidateEnrollment(req.user.id);
    await this.cacheService.del(`http:/api/enrollments/${id}`);

    return enrollment;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string, @Request() req: any) {
    const result = await this.enrollmentsService.remove(id);

    // Invalidate enrollment caches
    await this.cacheService.invalidateEnrollment(req.user.id);
    await this.cacheService.del(`http:/api/enrollments/${id}`);

    return result;
  }
}

