import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublicationsService } from './publications.service';
import { PublicationsController } from './publications.controller';
import { ManualPublishController } from './manual-publish.controller';
import { PublicationEventsService } from './publication-events.service';
import { Publication, User } from '../entities';
import { AuditModule } from '../audit/audit.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([Publication, User]), NotificationsModule, AuditModule],
  controllers: [PublicationsController, ManualPublishController],
  providers: [PublicationsService, PublicationEventsService],
  exports: [PublicationsService],
})
export class PublicationsModule {}
