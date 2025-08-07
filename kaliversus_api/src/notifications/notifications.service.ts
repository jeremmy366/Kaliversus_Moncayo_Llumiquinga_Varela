import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';
import { User } from '../entities/user.entity';
import { EmailQueueService } from './email-queue.service';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly emailQueueService: EmailQueueService,
    @Inject(EventEmitter2) private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(mensaje: string, usuarioId: string, tipo?: string, referenciaId?: string): Promise<Notification> {
    const usuario = await this.userRepository.findOne({ where: { id: usuarioId } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    const notification = this.notificationRepository.create({ mensaje, usuario, tipo, referenciaId });
    const saved = await this.notificationRepository.save(notification);
    // Enviar a RabbitMQ
    if (usuario.email) {
      await this.emailQueueService.sendEmailNotification({
        to: usuario.email,
        subject: 'Notificación Kaliversus',
        body: mensaje,
        tipo,
        referenciaId,
      });
    }
    // Emitir notificación SSE
    this.eventEmitter.emit('notification', {
      mensaje,
      usuarioId,
      tipo,
      referenciaId,
      fecha: saved.fechaCreacion,
    });
    return saved;
  }

  async findByUser(usuarioId: string): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { usuario: { id: usuarioId } },
      order: { fechaCreacion: 'DESC' },
    });
  }

  async markAsRead(id: string, usuarioId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id },
      relations: ['usuario'],
    });
    if (!notification || notification.usuario.id !== usuarioId) {
      throw new NotFoundException('Notificación no encontrada');
    }
    notification.leida = true;
    return this.notificationRepository.save(notification);
  }
}
