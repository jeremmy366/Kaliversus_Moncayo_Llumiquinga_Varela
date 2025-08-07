import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Verificar estado de la aplicación' })
  @ApiResponse({ 
    status: 200, 
    description: 'Aplicación funcionando correctamente',
    schema: {
      example: {
        status: 'ok',
        timestamp: '2025-07-29T23:32:00.000Z',
        uptime: 123.456,
        environment: 'development',
        message: 'Kaliversus API funcionando correctamente'
      }
    }
  })
  check() {
    return this.healthService.check();
  }

  @Get('simple')
  @ApiOperation({ summary: 'Health check simple' })
  @ApiResponse({ 
    status: 200, 
    description: 'Respuesta simple',
    schema: {
      example: 'OK'
    }
  })
  simple() {
    return 'OK';
  }
}
