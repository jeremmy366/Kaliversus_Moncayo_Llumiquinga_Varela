import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { connect, Channel, Connection } from 'amqplib';

@Injectable()
export class CatalogListenerProvider implements OnModuleInit {
  private channel: Channel;
  private readonly logger = new Logger(CatalogListenerProvider.name);

  constructor(private readonly catalogService: CatalogService) {}

  async onModuleInit() {
    // Configura la conexión a RabbitMQ
    const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
    const QUEUE = 'publication.published';
    const conn: Connection = await connect(RABBITMQ_URL);
    this.channel = await conn.createChannel();
    await this.channel.assertQueue(QUEUE, { durable: true });
    this.channel.consume(QUEUE, async (msg) => {
      if (msg) {
        try {
          const data = JSON.parse(msg.content.toString());
          await this.catalogService.saveOrUpdateFromEvent(data);
          this.logger.log(`Procesado evento publication.published: ${data.id}`);
          this.channel.ack(msg);
        } catch (err) {
          this.logger.error('Error procesando evento publication.published', err);
          this.channel.nack(msg, false, false); // descarta el mensaje
        }
      }
    });
    this.logger.log('Suscrito a publication.published');
  }
}
