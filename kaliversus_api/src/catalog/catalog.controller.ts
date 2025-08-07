import { Controller, Get, Query } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Catálogo')
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  @ApiQuery({ name: 'titulo', required: false })
  @ApiQuery({ name: 'autor', required: false })
  @ApiQuery({ name: 'tipo', required: false })
  @ApiQuery({ name: 'palabraClave', required: false, description: 'Palabra clave (parcial o exacta, puede ser array separada por coma)' })
  @ApiQuery({ name: 'coautor', required: false })
  @ApiQuery({ name: 'resumen', required: false })
  @ApiQuery({ name: 'fechaInicio', required: false, description: 'Fecha de inicio (YYYY-MM-DD)' })
  @ApiQuery({ name: 'fechaFin', required: false, description: 'Fecha de fin (YYYY-MM-DD)' })
  @ApiQuery({ name: 'page', required: false, description: 'Número de página', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Elementos por página', type: Number })
  async findAll(
    @Query('titulo') titulo?: string,
    @Query('autor') autor?: string,
    @Query('tipo') tipo?: string,
    @Query('palabraClave') palabraClave?: string,
    @Query('coautor') coautor?: string,
    @Query('resumen') resumen?: string,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.catalogService.findAllAdvanced({ titulo, autor, tipo, palabraClave, coautor, resumen, fechaInicio, fechaFin, page, limit });
  }
}
