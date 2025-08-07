import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AuditModule } from '../audit/audit.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from '../entities/audit-log.entity';

@Module({
  imports: [AuditModule, TypeOrmModule.forFeature([AuditLog])],
  controllers: [AdminController],
})
export class AdminModule {}