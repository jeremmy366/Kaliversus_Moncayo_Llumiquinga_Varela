import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, HealthCheckResult } from '@nestjs/terminus';
import { TypeOrmHealthIndicator } from '@nestjs/terminus';
import { RabbitMQHealthIndicator } from './health/rabbitmq.health';
import { EmailHealthIndicator } from './health/email.health';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private rabbit: RabbitMQHealthIndicator,
    private email: EmailHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.rabbit.isHealthy('rabbitmq'),
      () => this.email.isHealthy('email'),
    ]);
  }
}
