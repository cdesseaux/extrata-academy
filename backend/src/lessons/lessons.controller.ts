import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, HttpCode } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createLessonDto: any, @Request() req: any) {
    console.log('Criando lição:', createLessonDto, 'por usuário:', req.user);
    return this.lessonsService.create(createLessonDto);
  }

  @Get()
  findAll() {
    return this.lessonsService.findAll();
  }

  @Get('module/:moduleId')
  findByModule(@Param('moduleId') moduleId: string) {
    return this.lessonsService.findByModule(moduleId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lessonsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateLessonDto: any) {
    return this.lessonsService.update(id, updateLessonDto);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.lessonsService.remove(id);
  }

  @Post('module/:moduleId/reorder')
  @UseGuards(JwtAuthGuard)
  reorder(
    @Param('moduleId') moduleId: string,
    @Body() body: { lessonOrders: Array<{ id: string; order: number }> }
  ) {
    return this.lessonsService.reorder(moduleId, body.lessonOrders);
  }

  // Progress endpoints
  @Get(':id/progress')
  @UseGuards(JwtAuthGuard)
  getProgress(
    @Param('id') lessonId: string,
    @Request() req: any,
    @Body() body: { enrollmentId: string }
  ) {
    return this.lessonsService.getProgress(req.user.id, lessonId, body.enrollmentId);
  }

  @Post(':id/complete')
  @UseGuards(JwtAuthGuard)
  markAsCompleted(
    @Param('id') lessonId: string,
    @Request() req: any,
    @Body() body: { enrollmentId: string }
  ) {
    return this.lessonsService.markAsCompleted(req.user.id, lessonId, body.enrollmentId);
  }

  @Post(':id/watch-time')
  @UseGuards(JwtAuthGuard)
  updateWatchTime(
    @Param('id') lessonId: string,
    @Request() req: any,
    @Body() body: { enrollmentId: string; watchTime: number; lastPosition: number }
  ) {
    return this.lessonsService.updateWatchTime(
      req.user.id,
      lessonId,
      body.enrollmentId,
      body.watchTime,
      body.lastPosition
    );
  }

  @Get('enrollment/:enrollmentId/progress')
  @UseGuards(JwtAuthGuard)
  getEnrollmentProgress(@Param('enrollmentId') enrollmentId: string) {
    return this.lessonsService.getEnrollmentProgress(enrollmentId);
  }

  @Get('user/my-progress')
  @UseGuards(JwtAuthGuard)
  getUserProgress(@Request() req: any) {
    return this.lessonsService.getUserProgress(req.user.id);
  }

  @Get(':id/next')
  getNextLesson(@Param('id') lessonId: string, @Body() body: { moduleId: string }) {
    return this.lessonsService.getNextLesson(body.moduleId, lessonId);
  }

  @Get(':id/previous')
  getPreviousLesson(@Param('id') lessonId: string, @Body() body: { moduleId: string }) {
    return this.lessonsService.getPreviousLesson(body.moduleId, lessonId);
  }
}
