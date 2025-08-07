import { IsString, IsEnum, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoRevision } from '../../common/enums';

export class UpdateReviewDto {
  @ApiPropertyOptional({ 
    description: 'Estado de la revisión',
    enum: EstadoRevision
  })
  @IsOptional()
  @IsEnum(EstadoRevision)
  estado?: EstadoRevision;

  @ApiPropertyOptional({ description: 'Comentarios de la revisión' })
  @IsOptional()
  @IsString()
  comentarios?: string;

  @ApiPropertyOptional({ 
    description: 'Historial de cambios',
    example: { 
      action: 'review_submitted', 
      timestamp: '2025-07-30T10:00:00Z',
      comments: 'Review completada'
    }
  })
  @IsOptional()
  @IsObject()
  historialCambios?: Record<string, any>;
}
