import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { Notification } from '../entities/notification.entity';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { SseNotificationsController } from './sse.controller';
import { User } from '../entities/user.entity';
import { EmailQueueService } from './email-queue.service';

@Module({
  imports: [TypeOrmModule.forFeature([Notification, User]), EventEmitterModule.forRoot()],
  providers: [NotificationsService, EmailQueueService],
  controllers: [NotificationsController, SseNotificationsController],
  exports: [NotificationsService],
})
export class NotificationsModule {}
