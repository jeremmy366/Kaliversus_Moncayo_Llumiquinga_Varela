import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { RabbitMQHealthIndicator } from './rabbitmq.health';
import { EmailHealthIndicator } from './email.health';

@Module({
  imports: [TerminusModule, TypeOrmModule],
  controllers: [HealthController],
  providers: [HealthService, RabbitMQHealthIndicator, EmailHealthIndicator],
})
export class HealthModule {}
