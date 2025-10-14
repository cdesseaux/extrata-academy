import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LearningPathsService } from './learning-paths.service';
import { CreateLearningPathDto } from './dto/create-learning-path.dto';
import { UpdateLearningPathDto } from './dto/update-learning-path.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateLearningPathEnrollmentDto } from './dto/create-learning-path-enrollment.dto';
import { UpdateLearningPathProgressDto } from './dto/update-learning-path-progress.dto';

@ApiTags('Learning Paths')
@Controller('learning-paths')
export class LearningPathsController {
  constructor(private readonly learningPathsService: LearningPathsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new learning path' })
  @ApiResponse({ status: 201, description: 'Learning path created successfully' })
  create(@Body() dto: CreateLearningPathDto, @Request() req: any) {
    return this.learningPathsService.create(dto, req.user?.id);
  }

  @Get()
  @ApiOperation({ summary: 'List learning paths' })
  findAll() {
    return this.learningPathsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get learning path by id' })
  findOne(@Param('id') id: string) {
    return this.learningPathsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a learning path' })
  update(@Param('id') id: string, @Body() dto: UpdateLearningPathDto) {
    return this.learningPathsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a learning path' })
  remove(@Param('id') id: string) {
    return this.learningPathsService.remove(id);
  }

  // Enrollments
  @Post(':id/enroll')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Enroll current user into a learning path' })
  enroll(@Param('id') id: string, @Request() req: any) {
    return this.learningPathsService.enroll(req.user.id, id);
  }

  @Get(':id/enrollment')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user enrollment for a learning path' })
  getEnrollment(@Param('id') id: string, @Request() req: any) {
    return this.learningPathsService.getEnrollment(req.user.id, id);
  }

  @Patch(':id/progress')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update progress percentage for current user in a learning path' })
  updateProgress(
    @Param('id') id: string,
    @Body() dto: UpdateLearningPathProgressDto,
    @Request() req: any,
  ) {
    return this.learningPathsService.updateProgress(req.user.id, id, dto.progressPercentage);
  }
}


