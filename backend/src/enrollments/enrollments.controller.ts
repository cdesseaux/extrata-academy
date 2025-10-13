import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createEnrollmentDto: any, @Request() req: any) {
    console.log('Criando matrícula:', createEnrollmentDto, 'para usuário:', req.user);
    return this.enrollmentsService.create({
      ...createEnrollmentDto,
      userId: req.user.id,
    });
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.enrollmentsService.findAll();
  }

  @Get('my-enrollments')
  @UseGuards(JwtAuthGuard)
  findMyEnrollments(@Request() req: any) {
    return this.enrollmentsService.findByUser(req.user.id);
  }

  @Get('course/:courseId')
  @UseGuards(JwtAuthGuard)
  findByCourse(@Param('courseId') courseId: string) {
    return this.enrollmentsService.findByCourse(courseId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.enrollmentsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateEnrollmentDto: any) {
    return this.enrollmentsService.update(id, updateEnrollmentDto);
  }

  @Patch(':id/progress')
  @UseGuards(JwtAuthGuard)
  updateProgress(@Param('id') id: string, @Body() body: { progress: number }) {
    return this.enrollmentsService.updateProgress(id, body.progress);
  }

  @Patch(':id/calculate-progress')
  @UseGuards(JwtAuthGuard)
  calculateProgress(@Param('id') id: string) {
    return this.enrollmentsService.calculateProgressFromLessons(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.enrollmentsService.remove(id);
  }
}

