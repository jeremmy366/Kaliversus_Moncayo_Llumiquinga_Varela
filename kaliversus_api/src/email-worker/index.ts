import { NestFactory } from '@nestjs/core';
import { EmailWorkerModule } from './email-worker.module';
import { EmailWorkerService } from './email-worker.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(EmailWorkerModule);
  const worker = app.get(EmailWorkerService);
  await worker.listenForEmails();
  console.log('Email Worker iniciado');
}

bootstrap();
