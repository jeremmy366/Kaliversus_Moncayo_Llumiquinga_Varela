import { IsString, IsOptional, IsArray, IsEnum, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoPublicacion } from '../../common/enums';

export class CreatePublicationDto {
  @ApiProperty({ description: 'Título de la publicación', example: 'Análisis de Algoritmos de Machine Learning' })
  @IsString()
  titulo: string;

  @ApiPropertyOptional({ description: 'Resumen de la publicación' })
  @IsOptional()
  @IsString()
  resumen?: string;

  @ApiPropertyOptional({ 
    description: 'Palabras clave', 
    example: ['machine learning', 'algoritmos', 'inteligencia artificial']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  palabrasClave?: string[];

  @ApiProperty({ 
    description: 'Tipo de publicación',
    enum: TipoPublicacion,
    example: TipoPublicacion.ARTICULO
  })
  @IsEnum(TipoPublicacion)
  tipo: TipoPublicacion;

  @ApiPropertyOptional({ 
    description: 'Metadatos adicionales (ISBN, DOI, etc.)',
    example: { doi: '10.1000/182', pages: 25 }
  })
  @IsOptional()
  @IsObject()
  metadatos?: Record<string, any>;

  @ApiPropertyOptional({ 
    description: 'IDs de coautores (deben ser UUIDs válidos de usuarios existentes)',
    example: []
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  coautoresIds?: string[];
}
