import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';

@Injectable()
export class EmailQueueService {
  private client: ClientProxy;
  private readonly logger = new Logger(EmailQueueService.name);

  constructor(private readonly configService: ConfigService) {
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [
          this.configService.get('RABBITMQ_URL') || 'amqp://guest:guest@159.223.105.72:5672/'
        ],
        queue: this.configService.get('RABBITMQ_EMAIL_QUEUE') || 'email_notifications',
        queueOptions: { durable: true },
      },
    });
  }

  async sendEmailNotification(payload: any) {
    try {
      await this.client.emit('email_notification', payload).toPromise();
      this.logger.log('Mensaje enviado a la cola de email:', payload);
    } catch (error) {
      this.logger.error('Error enviando mensaje a RabbitMQ', error);
    }
  }
}
