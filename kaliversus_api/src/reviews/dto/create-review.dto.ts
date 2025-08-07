import { IsString, IsEnum, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoRevision } from '../../common/enums';

export class CreateReviewDto {
  @ApiProperty({ description: 'ID de la publicación a revisar' })
  @IsString()
  publicacionId: string;

  @ApiProperty({ description: 'ID del revisor asignado' })
  @IsString()
  revisorId: string;

  @ApiPropertyOptional({ description: 'Comentarios iniciales de la revisión' })
  @IsOptional()
  @IsString()
  comentarios?: string;

  @ApiPropertyOptional({ 
    description: 'Estado inicial de la revisión',
    enum: EstadoRevision,
    default: EstadoRevision.PENDIENTE
  })
  @IsOptional()
  @IsEnum(EstadoRevision)
  estado?: EstadoRevision;

  @ApiPropertyOptional({ 
    description: 'Historial de cambios inicial',
    example: { assignedBy: 'editor-id', assignedAt: '2025-07-30T10:00:00Z' }
  })
  @IsOptional()
  @IsObject()
  historialCambios?: Record<string, any>;
}
