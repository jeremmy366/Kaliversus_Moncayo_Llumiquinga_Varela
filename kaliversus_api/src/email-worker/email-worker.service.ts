import { Injectable } from '@nestjs/common';
import { connect } from 'amqplib';

@Injectable()
export class EmailWorkerService {
  async listenForEmails() {
    const queue = process.env.RABBITMQ_EMAIL_QUEUE || 'email_notifications';
    const url = process.env.RABBITMQ_URL;
    const connection = await connect(url);
    const channel = await connection.createChannel();
    await channel.assertQueue(queue, { durable: true });
    console.log(`[EmailWorker] Esperando mensajes en ${queue}`);
    channel.consume(queue, async (msg) => {
      if (msg) {
        const content = msg.content.toString();
        console.log('[EmailWorker] Mensaje recibido:', content);
        // Aquí iría la lógica para enviar el email usando tu servicio preferido
        channel.ack(msg);
      }
    });
  }
}
