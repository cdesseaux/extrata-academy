import { IsArray, IsUUID, ArrayMinSize } from 'class-validator';

export class ReorderModulesDto {
  @IsArray({ message: 'moduleIds deve ser um array' })
  @ArrayMinSize(1, { message: 'Deve haver pelo menos 1 módulo para reordenar' })
  @IsUUID('4', { each: true, message: 'Cada ID de módulo deve ser um UUID válido' })
  moduleIds: string[];
}
