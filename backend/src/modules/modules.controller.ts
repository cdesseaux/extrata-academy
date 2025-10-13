import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, HttpCode } from '@nestjs/common';
import { ModulesService } from './modules.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('modules')
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createModuleDto: any, @Request() req: any) {
    console.log('Criando módulo:', createModuleDto, 'por usuário:', req.user);
    return this.modulesService.create(createModuleDto);
  }

  @Get()
  findAll() {
    return this.modulesService.findAll();
  }

  @Get('course/:courseId')
  findByCourse(@Param('courseId') courseId: string) {
    return this.modulesService.findByCourse(courseId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.modulesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateModuleDto: any) {
    return this.modulesService.update(id, updateModuleDto);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.modulesService.remove(id);
  }

  @Post('course/:courseId/reorder')
  @UseGuards(JwtAuthGuard)
  reorder(
    @Param('courseId') courseId: string,
    @Body() body: { moduleOrders: Array<{ id: string; order: number }> }
  ) {
    return this.modulesService.reorder(courseId, body.moduleOrders);
  }

  @Post(':id/duplicate')
  @UseGuards(JwtAuthGuard)
  duplicate(@Param('id') id: string) {
    return this.modulesService.duplicate(id);
  }

  @Patch(':id/update-duration')
  @UseGuards(JwtAuthGuard)
  updateDuration(@Param('id') id: string) {
    return this.modulesService.updateDuration(id);
  }
}
