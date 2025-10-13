import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Module } from './entities/module.entity';

@Injectable()
export class ModulesService {
  constructor(
    @InjectRepository(Module)
    private modulesRepository: Repository<Module>,
  ) {}

  async create(moduleData: Partial<Module>): Promise<Module> {
    // Pega a maior ordem atual e adiciona 1
    const maxOrder = await this.modulesRepository
      .createQueryBuilder('module')
      .where('module.courseId = :courseId', { courseId: moduleData.courseId })
      .select('MAX(module.order)', 'maxOrder')
      .getRawOne();

    const module = this.modulesRepository.create({
      ...moduleData,
      order: maxOrder?.maxOrder !== null ? maxOrder.maxOrder + 1 : 0,
    });

    return this.modulesRepository.save(module);
  }

  async findAll(): Promise<Module[]> {
    return this.modulesRepository.find({
      where: { isActive: true },
      relations: ['lessons', 'course'],
      order: { order: 'ASC', createdAt: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Module> {
    const module = await this.modulesRepository.findOne({
      where: { id, isActive: true },
      relations: ['lessons', 'course'],
    });

    if (!module) {
      throw new NotFoundException(`Módulo com ID ${id} não encontrado`);
    }

    return module;
  }

  async findByCourse(courseId: string): Promise<Module[]> {
    return this.modulesRepository.find({
      where: { courseId, isActive: true },
      relations: ['lessons'],
      order: { order: 'ASC', createdAt: 'ASC' },
    });
  }

  async update(id: string, moduleData: Partial<Module>): Promise<Module> {
    const module = await this.findOne(id);

    Object.assign(module, moduleData);

    return this.modulesRepository.save(module);
  }

  async remove(id: string): Promise<void> {
    const module = await this.findOne(id);
    module.isActive = false;
    await this.modulesRepository.save(module);
  }

  async reorder(courseId: string, moduleOrders: Array<{ id: string; order: number }>): Promise<Module[]> {
    // Atualiza a ordem de cada módulo
    for (const { id, order } of moduleOrders) {
      await this.modulesRepository.update({ id, courseId }, { order });
    }

    return this.findByCourse(courseId);
  }

  async duplicate(id: string): Promise<Module> {
    const original = await this.findOne(id);

    const duplicated = this.modulesRepository.create({
      courseId: original.courseId,
      title: `${original.title} (Cópia)`,
      description: original.description,
      duration: original.duration,
      isActive: original.isActive,
    });

    return this.modulesRepository.save(duplicated);
  }

  async updateDuration(moduleId: string): Promise<Module> {
    const module = await this.findOne(moduleId);

    // Calcula a duração total somando as lições
    const totalDuration = module.lessons
      ?.filter(lesson => lesson.isActive)
      .reduce((sum, lesson) => sum + (lesson.duration || 0), 0) || 0;

    module.duration = Math.ceil(totalDuration / 60); // converte segundos para minutos

    return this.modulesRepository.save(module);
  }
}
