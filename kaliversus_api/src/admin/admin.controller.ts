import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
  ) {}

  @Get('activity')
  @Roles('ROLE_ADMIN')
  @ApiOperation({ summary: 'Obtener actividad reciente del sistema (logs/auditoría)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Cantidad de eventos a devolver (default: 20)' })
  @ApiResponse({ status: 200, description: 'Lista de eventos recientes' })
  async getRecentActivity(@Query('limit') limit = 20) {
    const logs = await this.auditRepo.find({
      order: { timestamp: 'DESC' },
      take: Math.max(1, Math.min(Number(limit) || 20, 100)),
    });
    return logs.map(log => ({
      id: log.id,
      type: log.action,
      message: this.formatMessage(log),
      timestamp: log.timestamp,
      severity: this.mapSeverity(log.action),
      userId: log.userId,
      details: log.details,
    }));
  }

  private formatMessage(log: AuditLog): string {
    // Puedes personalizar los mensajes según el tipo de acción
    switch (log.action) {
      case 'CREAR_PUBLICACION':
        return `Nueva publicación creada: ${log.details?.titulo || ''}`;
      case 'ACTUALIZAR_PUBLICACION':
        return `Publicación actualizada (ID: ${log.details?.id})`;
      case 'ELIMINAR_PUBLICACION':
        return `Publicación eliminada (ID: ${log.details?.id})`;
      case 'ENVIAR_A_REVISION':
        return `Publicación enviada a revisión (ID: ${log.details?.id})`;
      default:
        return log.action;
    }
  }

  private mapSeverity(action: string): string {
    if (action.includes('ELIMINAR')) return 'warning';
    if (action.includes('CREAR')) return 'info';
    if (action.includes('ACTUALIZAR')) return 'info';
    if (action.includes('ENVIAR')) return 'success';
    return 'info';
  }
}
