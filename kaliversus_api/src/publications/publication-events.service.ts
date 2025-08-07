import { Injectable, Logger } from '@nestjs/common';
import { connect, Channel, Connection } from 'amqplib';

@Injectable()
export class PublicationEventsService {
  private channel: Channel;
  private readonly logger = new Logger(PublicationEventsService.name);
  private isConnected = false;

  async emitPublicationPublished(event: any) {
    if (!this.isConnected) {
      await this.connect();
    }
    const QUEUE = 'publication.published';
    await this.channel.assertQueue(QUEUE, { durable: true });
    this.channel.sendToQueue(QUEUE, Buffer.from(JSON.stringify(event)), { persistent: true });
    this.logger.log(`Evento publication.published emitido: ${event.id}`);
  }

  private async connect() {
    const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
    const conn: Connection = await connect(RABBITMQ_URL);
    this.channel = await conn.createChannel();
    this.isConnected = true;
  }
}
