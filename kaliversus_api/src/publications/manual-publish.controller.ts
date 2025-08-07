import { Controller, Post, Body } from '@nestjs/common';
import { PublicationEventsService } from './publication-events.service';

@Controller('manual-publish')
export class ManualPublishController {
  constructor(private readonly eventsService: PublicationEventsService) {}

  @Post()
  async publish(@Body() data: any) {
    await this.eventsService.emitPublicationPublished(data);
    return { message: 'Evento publication.published emitido', data };
  }
}
