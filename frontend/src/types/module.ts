import { Lesson } from './lesson';

export interface Module {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  order: number;
  duration: number; // em minutos (soma das lições)
  lessons?: Lesson[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateModuleDto {
  courseId: string;
  title: string;
  description?: string;
  order?: number;
  duration?: number;
  isActive?: boolean;
}

export interface UpdateModuleDto {
  title?: string;
  description?: string;
  order?: number;
  duration?: number;
  isActive?: boolean;
}

export interface ReorderModulesDto {
  moduleIds: string[];
}
