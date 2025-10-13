import { IsArray, IsUUID, ArrayMinSize } from 'class-validator';

export class ReorderLessonsDto {
  @IsArray({ message: 'lessonIds deve ser um array' })
  @ArrayMinSize(1, { message: 'Deve haver pelo menos 1 lição para reordenar' })
  @IsUUID('4', { each: true, message: 'Cada ID de lição deve ser um UUID válido' })
  lessonIds: string[];
}
