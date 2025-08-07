import { IsString, IsOptional, IsNumber, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSuggestionDto {
  @ApiProperty({ description: 'ID de la publicación a sugerir/comentar' })
  @IsString()
  publicacionId: string;

  @ApiProperty({ description: 'Comentarios del revisor externo' })
  @IsString()
  comentarios: string;

  @ApiProperty({ description: 'Calificación sugerida (opcional)', required: false })
  @IsOptional()
  @IsNumber()
  calificacion?: number;

  @ApiProperty({ description: 'Tipo de sugerencia', enum: ['SUGERENCIA'] })
  @IsString()
  @IsIn(['SUGERENCIA'])
  tipo: string;
}
