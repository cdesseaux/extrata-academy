import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, HttpCode, UseInterceptors } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { HttpCacheInterceptor } from '../common/interceptors/cache.interceptor';
import { CacheService } from '../common/services/cache.service';

@Controller('lessons')
export class LessonsController {
  constructor(
    private readonly lessonsService: LessonsService,
    private readonly cacheService: CacheService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createLessonDto: any, @Request() req: any) {
    console.log('Criando lição:', createLessonDto, 'por usuário:', req.user);
    const lesson = await this.lessonsService.create(createLessonDto);

    // Invalidate lesson caches
    await this.cacheService.delByPattern('http:/api/lessons?*');
    if (createLessonDto.moduleId) {
      await this.cacheService.delByPattern(`http:/api/lessons/module/${createLessonDto.moduleId}*`);
    }

    return lesson;
  }

  @Get()
  @UseInterceptors(HttpCacheInterceptor)
  findAll() {
    return this.lessonsService.findAll();
  }

  @Get('module/:moduleId')
  @UseInterceptors(HttpCacheInterceptor)
  findByModule(@Param('moduleId') moduleId: string) {
    return this.lessonsService.findByModule(moduleId);
  }

  @Get(':id')
  @UseInterceptors(HttpCacheInterceptor)
  findOne(@Param('id') id: string) {
    return this.lessonsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() updateLessonDto: any) {
    const lesson = await this.lessonsService.update(id, updateLessonDto);

    // Invalidate lesson caches
    await this.cacheService.del(`http:/api/lessons/${id}`);
    await this.cacheService.delByPattern('http:/api/lessons?*');
    if (lesson.moduleId) {
      await this.cacheService.delByPattern(`http:/api/lessons/module/${lesson.moduleId}*`);
    }

    return lesson;
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string) {
    const lesson = await this.lessonsService.findOne(id);
    const result = await this.lessonsService.remove(id);

    // Invalidate lesson caches
    await this.cacheService.del(`http:/api/lessons/${id}`);
    await this.cacheService.delByPattern('http:/api/lessons?*');
    if (lesson?.moduleId) {
      await this.cacheService.delByPattern(`http:/api/lessons/module/${lesson.moduleId}*`);
    }

    return result;
  }

  @Post('module/:moduleId/reorder')
  @UseGuards(JwtAuthGuard)
  async reorder(
    @Param('moduleId') moduleId: string,
    @Body() body: { lessonOrders: Array<{ id: string; order: number }> }
  ) {
    const result = await this.lessonsService.reorder(moduleId, body.lessonOrders);

    // Invalidate lesson caches
    await this.cacheService.delByPattern('http:/api/lessons?*');
    await this.cacheService.delByPattern(`http:/api/lessons/module/${moduleId}*`);

    return result;
  }

  // Progress endpoints
  @Get(':id/progress')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(HttpCacheInterceptor)
  getProgress(
    @Param('id') lessonId: string,
    @Request() req: any,
    @Body() body: { enrollmentId: string }
  ) {
    return this.lessonsService.getProgress(req.user.id, lessonId, body.enrollmentId);
  }

  @Post(':id/complete')
  @UseGuards(JwtAuthGuard)
  async markAsCompleted(
    @Param('id') lessonId: string,
    @Request() req: any,
    @Body() body: { enrollmentId: string }
  ) {
    const result = await this.lessonsService.markAsCompleted(req.user.id, lessonId, body.enrollmentId);

    // Invalidate lesson progress and enrollment caches
    await this.cacheService.delByPattern(`http:/api/lessons/${lessonId}/progress*`);
    await this.cacheService.delByPattern(`http:/api/lessons/enrollment/${body.enrollmentId}/progress*`);
    await this.cacheService.delByPattern(`http:/api/lessons/user/my-progress*user:${req.user.id}*`);
    await this.cacheService.invalidateEnrollment(req.user.id);

    return result;
  }

  @Post(':id/watch-time')
  @UseGuards(JwtAuthGuard)
  async updateWatchTime(
    @Param('id') lessonId: string,
    @Request() req: any,
    @Body() body: { enrollmentId: string; watchTime: number; lastPosition: number }
  ) {
    const result = await this.lessonsService.updateWatchTime(
      req.user.id,
      lessonId,
      body.enrollmentId,
      body.watchTime,
      body.lastPosition
    );

    // Invalidate lesson progress and enrollment caches
    await this.cacheService.delByPattern(`http:/api/lessons/${lessonId}/progress*`);
    await this.cacheService.delByPattern(`http:/api/lessons/enrollment/${body.enrollmentId}/progress*`);
    await this.cacheService.delByPattern(`http:/api/lessons/user/my-progress*user:${req.user.id}*`);
    await this.cacheService.invalidateEnrollment(req.user.id);

    return result;
  }

  @Get('enrollment/:enrollmentId/progress')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(HttpCacheInterceptor)
  getEnrollmentProgress(@Param('enrollmentId') enrollmentId: string) {
    return this.lessonsService.getEnrollmentProgress(enrollmentId);
  }

  @Get('user/my-progress')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(HttpCacheInterceptor)
  getUserProgress(@Request() req: any) {
    return this.lessonsService.getUserProgress(req.user.id);
  }

  @Get(':id/next')
  @UseInterceptors(HttpCacheInterceptor)
  getNextLesson(@Param('id') lessonId: string, @Body() body: { moduleId: string }) {
    return this.lessonsService.getNextLesson(body.moduleId, lessonId);
  }

  @Get(':id/previous')
  @UseInterceptors(HttpCacheInterceptor)
  getPreviousLesson(@Param('id') lessonId: string, @Body() body: { moduleId: string }) {
    return this.lessonsService.getPreviousLesson(body.moduleId, lessonId);
  }
}
