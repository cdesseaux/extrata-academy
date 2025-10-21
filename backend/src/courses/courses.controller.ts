import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { CreateCourseDto, UpdateCourseDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { HttpCacheInterceptor } from '../common/interceptors/cache.interceptor';
import { CacheService } from '../common/services/cache.service';

@ApiTags('Courses')
@Controller('courses')
export class CoursesController {
  constructor(
    private readonly coursesService: CoursesService,
    private readonly cacheService: CacheService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new course' })
  @ApiResponse({ status: 201, description: 'Course created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  async create(@Body() createCourseDto: CreateCourseDto, @Request() req: any) {
    const course = await this.coursesService.create({
      ...createCourseDto,
      instructorId: req.user.id,
    });

    // Invalidate course list cache
    await this.cacheService.delByPattern('http:/api/courses?*');
    await this.cacheService.delByPattern('http:/api/courses/my-courses*');

    return course;
  }

  @Get()
  @UseInterceptors(HttpCacheInterceptor) // Cache for 5 minutes
  @ApiOperation({ summary: 'Get all courses' })
  @ApiResponse({ status: 200, description: 'List of all courses' })
  findAll() {
    return this.coursesService.findAll();
  }

  @Get('my-courses')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(HttpCacheInterceptor) // Cache for 5 minutes
  @ApiOperation({ summary: 'Get my courses (as instructor)' })
  @ApiResponse({ status: 200, description: 'List of instructor courses' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findMyCourses(@Request() req: any) {
    return this.coursesService.findByInstructor(req.user.id);
  }

  @Get(':id')
  @UseInterceptors(HttpCacheInterceptor) // Cache for 5 minutes
  @ApiOperation({ summary: 'Get course by ID' }}
  @ApiParam({ name: 'id', description: 'Course UUID' })
  @ApiResponse({ status: 200, description: 'Course details' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update course' })
  @ApiParam({ name: 'id', description: 'Course UUID' })
  @ApiResponse({ status: 200, description: 'Course updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    const course = await this.coursesService.update(id, updateCourseDto);

    // Invalidate cache for this course and lists
    await this.cacheService.invalidateCourse(id);

    return course;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete course' })
  @ApiParam({ name: 'id', description: 'Course UUID' })
  @ApiResponse({ status: 200, description: 'Course deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async remove(@Param('id') id: string) {
    const result = await this.coursesService.remove(id);

    // Invalidate cache for this course and lists
    await this.cacheService.invalidateCourse(id);

    return result;
  }

  @Patch(':id/publish')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Publish course' })
  @ApiParam({ name: 'id', description: 'Course UUID' })
  @ApiResponse({ status: 200, description: 'Course published successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async publish(@Param('id') id: string) {
    const course = await this.coursesService.publish(id);

    // Invalidate cache
    await this.cacheService.invalidateCourse(id);

    return course;
  }

  @Patch(':id/unpublish')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Unpublish course' })
  @ApiParam({ name: 'id', description: 'Course UUID' })
  @ApiResponse({ status: 200, description: 'Course unpublished successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async unpublish(@Param('id') id: string) {
    const course = await this.coursesService.unpublish(id);

    // Invalidate cache
    await this.cacheService.invalidateCourse(id);

    return course;
  }

  @Patch(':id/update-duration')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Recalculate course duration based on modules' })
  @ApiParam({ name: 'id', description: 'Course UUID' })
  @ApiResponse({ status: 200, description: 'Duration updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateDuration(@Param('id') id: string) {
    const course = await this.coursesService.updateCourseDuration(id);

    // Invalidate cache
    await this.cacheService.invalidateCourse(id);

    return course;
  }
}










