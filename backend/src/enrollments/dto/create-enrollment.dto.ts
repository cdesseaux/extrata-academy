import { IsUUID, IsNotEmpty, IsOptional, IsString, IsIn } from 'class-validator';

export class CreateEnrollmentDto {
  @IsUUID('4', { message: 'ID do usuário deve ser um UUID válido' })
  @IsNotEmpty({ message: 'ID do usuário é obrigatório' })
  userId: string;

  @IsUUID('4', { message: 'ID do curso deve ser um UUID válido' })
  @IsNotEmpty({ message: 'ID do curso é obrigatório' })
  courseId: string;

  @IsOptional()
  @IsString({ message: 'Status deve ser uma string' })
  @IsIn(['enrolled', 'completed', 'dropped'], { message: 'Status inválido' })
  status?: string;
}
