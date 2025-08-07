import { IsEmail, IsString, MinLength, IsOptional, IsArray, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../common/enums';

export class RegisterDto {
  @ApiProperty({ description: 'Nombres del usuario', example: 'Juan Carlos' })
  @IsString()
  nombres: string;

  @ApiProperty({ description: 'Apellidos del usuario', example: 'Pérez García' })
  @IsString()
  apellidos: string;

  @ApiProperty({ description: 'Email único del usuario', example: 'juan.perez@universidad.edu' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Contraseña (mínimo 6 caracteres)', example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ description: 'Afiliación institucional', example: 'Universidad Nacional' })
  @IsOptional()
  @IsString()
  afiliacion?: string;

  @ApiPropertyOptional({ description: 'ORCID del usuario', example: '0000-0000-0000-0000' })
  @IsOptional()
  @IsString()
  orcid?: string;

  @ApiPropertyOptional({ description: 'Biografía del usuario' })
  @IsOptional()
  @IsString()
  biografia?: string;

  @ApiPropertyOptional({ description: 'URL de la foto de perfil' })
  @IsOptional()
  @IsString()
  fotoUrl?: string;

  @ApiPropertyOptional({ 
    description: 'Roles del usuario', 
    enum: UserRole,
    isArray: true,
    example: [UserRole.AUTOR]
  })
  @IsOptional()
  @IsArray()
  @IsEnum(UserRole, { each: true })
  roles?: UserRole[];
}
