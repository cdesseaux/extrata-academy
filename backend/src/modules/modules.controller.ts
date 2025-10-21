import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, HttpCode, UseInterceptors } from '@nestjs/common';
import { ModulesService } from './modules.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { HttpCacheInterceptor } from '../common/interceptors/cache.interceptor';
import { CacheService } from '../common/services/cache.service';

@Controller('modules')
export class ModulesController {
  constructor(
    private readonly modulesService: ModulesService,
    private readonly cacheService: CacheService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createModuleDto: any, @Request() req: any) {
    console.log('Criando módulo:', createModuleDto, 'por usuário:', req.user);
    const module = await this.modulesService.create(createModuleDto);

    // Invalidate module and parent course caches
    await this.cacheService.delByPattern('http:/api/modules?*');
    if (createModuleDto.courseId) {
      await this.cacheService.delByPattern(`http:/api/modules/course/${createModuleDto.courseId}*`);
      await this.cacheService.invalidateCourse(createModuleDto.courseId);
    }

    return module;
  }

  @Get()
  @UseInterceptors(HttpCacheInterceptor)
  findAll() {
    return this.modulesService.findAll();
  }

  @Get('course/:courseId')
  @UseInterceptors(HttpCacheInterceptor)
  findByCourse(@Param('courseId') courseId: string) {
    return this.modulesService.findByCourse(courseId);
  }

  @Get(':id')
  @UseInterceptors(HttpCacheInterceptor)
  findOne(@Param('id') id: string) {
    return this.modulesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() updateModuleDto: any) {
    const module = await this.modulesService.update(id, updateModuleDto);

    // Invalidate module and parent course caches
    await this.cacheService.del(`http:/api/modules/${id}`);
    await this.cacheService.delByPattern('http:/api/modules?*');
    if (module.courseId) {
      await this.cacheService.delByPattern(`http:/api/modules/course/${module.courseId}*`);
      await this.cacheService.invalidateCourse(module.courseId);
    }

    return module;
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string) {
    // Get module first to know its courseId for cache invalidation
    const module = await this.modulesService.findOne(id);
    const result = await this.modulesService.remove(id);

    // Invalidate module and parent course caches
    await this.cacheService.del(`http:/api/modules/${id}`);
    await this.cacheService.delByPattern('http:/api/modules?*');
    if (module?.courseId) {
      await this.cacheService.delByPattern(`http:/api/modules/course/${module.courseId}*`);
      await this.cacheService.invalidateCourse(module.courseId);
    }

    return result;
  }

  @Post('course/:courseId/reorder')
  @UseGuards(JwtAuthGuard)
  async reorder(
    @Param('courseId') courseId: string,
    @Body() body: { moduleOrders: Array<{ id: string; order: number }> }
  ) {
    const result = await this.modulesService.reorder(courseId, body.moduleOrders);

    // Invalidate module and parent course caches
    await this.cacheService.delByPattern('http:/api/modules?*');
    await this.cacheService.delByPattern(`http:/api/modules/course/${courseId}*`);
    await this.cacheService.invalidateCourse(courseId);

    return result;
  }

  @Post(':id/duplicate')
  @UseGuards(JwtAuthGuard)
  async duplicate(@Param('id') id: string) {
    const newModule = await this.modulesService.duplicate(id);

    // Invalidate module and parent course caches
    await this.cacheService.delByPattern('http:/api/modules?*');
    if (newModule.courseId) {
      await this.cacheService.delByPattern(`http:/api/modules/course/${newModule.courseId}*`);
      await this.cacheService.invalidateCourse(newModule.courseId);
    }

    return newModule;
  }

  @Patch(':id/update-duration')
  @UseGuards(JwtAuthGuard)
  async updateDuration(@Param('id') id: string) {
    const module = await this.modulesService.updateDuration(id);

    // Invalidate module and parent course caches
    await this.cacheService.del(`http:/api/modules/${id}`);
    await this.cacheService.delByPattern('http:/api/modules?*');
    if (module.courseId) {
      await this.cacheService.delByPattern(`http:/api/modules/course/${module.courseId}*`);
      await this.cacheService.invalidateCourse(module.courseId);
    }

    return module;
  }
}
