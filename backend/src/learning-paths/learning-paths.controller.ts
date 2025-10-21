import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LearningPathsService } from './learning-paths.service';
import { CreateLearningPathDto } from './dto/create-learning-path.dto';
import { UpdateLearningPathDto } from './dto/update-learning-path.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateLearningPathEnrollmentDto } from './dto/create-learning-path-enrollment.dto';
import { UpdateLearningPathProgressDto } from './dto/update-learning-path-progress.dto';
import { HttpCacheInterceptor } from '../common/interceptors/cache.interceptor';
import { CacheService } from '../common/services/cache.service';

@ApiTags('Learning Paths')
@Controller('learning-paths')
export class LearningPathsController {
  constructor(
    private readonly learningPathsService: LearningPathsService,
    private readonly cacheService: CacheService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new learning path' })
  @ApiResponse({ status: 201, description: 'Learning path created successfully' })
  async create(@Body() dto: CreateLearningPathDto, @Request() req: any) {
    const learningPath = await this.learningPathsService.create(dto, req.user?.id);

    // Invalidate learning paths list cache
    await this.cacheService.invalidateLearningPath();

    return learningPath;
  }

  @Get()
  @UseInterceptors(HttpCacheInterceptor)
  @ApiOperation({ summary: 'List learning paths' })
  findAll() {
    return this.learningPathsService.findAll();
  }

  @Get(':id')
  @UseInterceptors(HttpCacheInterceptor)
  @ApiOperation({ summary: 'Get learning path by id' })
  findOne(@Param('id') id: string) {
    return this.learningPathsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a learning path' })
  async update(@Param('id') id: string, @Body() dto: UpdateLearningPathDto) {
    const learningPath = await this.learningPathsService.update(id, dto);

    // Invalidate learning path caches
    await this.cacheService.invalidateLearningPath(id);

    return learningPath;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a learning path' })
  async remove(@Param('id') id: string) {
    const result = await this.learningPathsService.remove(id);

    // Invalidate learning path caches
    await this.cacheService.invalidateLearningPath(id);

    return result;
  }

  // Enrollments
  @Post(':id/enroll')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Enroll current user into a learning path' })
  async enroll(@Param('id') id: string, @Request() req: any) {
    const enrollment = await this.learningPathsService.enroll(req.user.id, id);

    // Invalidate learning path enrollment caches
    await this.cacheService.delByPattern(`http:/api/learning-paths/${id}/enrollment*user:${req.user.id}*`);

    return enrollment;
  }

  @Get(':id/enrollment')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(HttpCacheInterceptor)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user enrollment for a learning path' })
  getEnrollment(@Param('id') id: string, @Request() req: any) {
    return this.learningPathsService.getEnrollment(req.user.id, id);
  }

  @Patch(':id/progress')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update progress percentage for current user in a learning path' })
  async updateProgress(
    @Param('id') id: string,
    @Body() dto: UpdateLearningPathProgressDto,
    @Request() req: any,
  ) {
    const enrollment = await this.learningPathsService.updateProgress(req.user.id, id, dto.progressPercentage);

    // Invalidate learning path enrollment caches
    await this.cacheService.delByPattern(`http:/api/learning-paths/${id}/enrollment*user:${req.user.id}*`);

    return enrollment;
  }
}


