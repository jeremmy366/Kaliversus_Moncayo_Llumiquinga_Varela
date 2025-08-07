import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class SendEmailDto {
  @ApiProperty({ example: 'usuario@ejemplo.com' })
  @IsEmail()
  to: string;

  @ApiProperty({ example: 'Asunto de prueba' })
  @IsString()
  subject: string;

  @ApiProperty({ example: '¡Hola! Esto es una prueba.' })
  @IsString()
  message: string;
}
