import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignReviewerDto {
  @ApiProperty({ description: 'ID del revisor a asignar' })
  @IsString()
  revisorId: string;
}
