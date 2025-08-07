import { PartialType } from '@nestjs/swagger';
import { User } from '../../entities';

export class UpdateUserDto extends PartialType(User) {}
