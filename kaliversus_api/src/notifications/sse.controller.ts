import { Controller, Sse, MessageEvent, Post, Body } from '@nestjs/common';
import { Observable, fromEvent, map } from 'rxjs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IsOptional, IsString } from 'class-validator';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
class TestSseDto {
  @IsString()
  @IsOptional()
  message?: string;

  @IsString()
  @IsOptional()
  timestamp?: string;
}

@Controller('notifications')
export class SseNotificationsController {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  @Sse('stream')
  sse(): Observable<MessageEvent> {
    return fromEvent(this.eventEmitter, 'notification').pipe(
      map((data: any) => ({ data }))
    );
  }

  @Post('test-sse')
  testSse(@Body() body: TestSseDto) {
    this.eventEmitter.emit('notification', body && body.message ? body : { message: 'Notificación de prueba SSE', timestamp: new Date().toISOString() });
    return { ok: true };
  }
}
