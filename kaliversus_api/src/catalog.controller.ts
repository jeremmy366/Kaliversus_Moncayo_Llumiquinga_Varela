import { Controller, Get, Query, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PublicationsService } from './publications/publications.service';
import { EstadoPublicacion } from './common/enums';

@ApiTags('Catálogo')
@Controller('catalog')
export class CatalogController {
  constructor(private readonly publicationsService: PublicationsService) {}

  @Get()
  @ApiOperation({ summary: 'Catálogo público de publicaciones aprobadas' })
  @ApiQuery({ name: 'page', required: false, description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, description: 'Elementos por página' })
  @ApiQuery({ name: 'titulo', required: false, description: 'Título (parcial o exacto)' })
  @ApiQuery({ name: 'palabraClave', required: false, description: 'Palabra clave (parcial)' })
  @ApiQuery({ name: 'tipo', required: false, description: 'Tipo de publicación' })
  async getCatalog(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('titulo') titulo?: string,
    @Query('palabraClave') palabraClave?: string,
    @Query('tipo') tipo?: string,
  ) {
    // Solo publicaciones aprobadas
    return this.publicationsService.findAllAdvanced({
      page,
      limit,
      titulo,
      estado: EstadoPublicacion.APROBADO,
      palabraClave,
      tipo,
    });
  }
}
