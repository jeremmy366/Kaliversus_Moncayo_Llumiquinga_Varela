import { Controller, Get, Param, Patch, Req, UseGuards, Post, Body, Logger, Inject } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { EmailQueueService } from './email-queue.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { SendEmailDto } from './dto/send-email.dto';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  private readonly logger = new Logger(NotificationsController.name);
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly emailQueueService: EmailQueueService,
  ) {}

  @Post('send-email')
  @Roles('ROLE_ADMIN')
  async sendTestEmail(@Body() body: SendEmailDto, @Req() req) {
    const payload = {
      to: body.to,
      subject: body.subject,
      body: body.message,
    };
    this.logger.log(`Intentando enviar email a ${body.to}`, NotificationsController.name);
    try {
      await this.emailQueueService.sendEmailNotification(payload);
      // Registrar notificación para el usuario autenticado
      await this.notificationsService.create(
        `Email enviado a ${body.to} con asunto: ${body.subject}`,
        req.user.id,
        'EMAIL_SENT'
      );
      this.logger.log(`Email enviado a la cola correctamente para ${body.to}`, NotificationsController.name);
      return { message: 'Email enviado a la cola correctamente' };
    } catch (error) {
      this.logger.error(`Error enviando email a la cola: ${error?.message || error}`);
      return { message: 'Error enviando email a la cola', error: error?.message || error };
    }
  }

  @Get()
  @ApiOperation({ summary: 'Obtener notificaciones del usuario autenticado' })
  async getMyNotifications(@Req() req) {
    return this.notificationsService.findByUser(req.user.id);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Marcar notificación como leída' })
  async markAsRead(@Param('id') id: string, @Req() req) {
    return this.notificationsService.markAsRead(id, req.user.id);
  }
}
