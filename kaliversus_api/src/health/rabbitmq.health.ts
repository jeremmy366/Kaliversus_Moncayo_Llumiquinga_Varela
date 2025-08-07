import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQHealthIndicator extends HealthIndicator {
  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
      await connection.close();
      return this.getStatus(key, true);
    } catch (err) {
      throw new HealthCheckError('RabbitMQ check failed', this.getStatus(key, false, { message: err.message }));
    }
  }
}
