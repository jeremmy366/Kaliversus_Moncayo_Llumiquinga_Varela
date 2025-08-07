
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PublicationsService } from './publications.service';
import { AuditService } from '../audit/audit.service';
import { CreatePublicationDto } from './dto/create-publication.dto';
import { UpdatePublicationDto } from './dto/update-publication.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../entities';




@ApiTags('Publicaciones')
@Controller('publications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PublicationsController {
  constructor(
    private readonly publicationsService: PublicationsService,
    private readonly auditService: AuditService,
  ) {}

  @Post()
  @Roles('ROLE_AUTOR', 'ROLE_EDITOR', 'ROLE_ADMIN')
  @ApiOperation({ summary: 'Crear nueva publicación' })
  @ApiResponse({ status: 201, description: 'Publicación creada exitosamente' })
  async create(
    @Body() createPublicationDto: CreatePublicationDto,
    @CurrentUser() user: User,
  ) {
    const pub = await this.publicationsService.create(createPublicationDto, user.id);
    await this.auditService.log(user.id, 'CREAR_PUBLICACION', { titulo: createPublicationDto.titulo, id: pub.id });
    return pub;
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las publicaciones (búsqueda avanzada)' })
  @ApiQuery({ name: 'page', required: false, description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, description: 'Elementos por página' })
  @ApiQuery({ name: 'titulo', required: false, description: 'Título (parcial o exacto)' })
  @ApiQuery({ name: 'estado', required: false, description: 'Estado de la publicación' })
  @ApiQuery({ name: 'autor', required: false, description: 'ID del autor principal' })
  @ApiQuery({ name: 'palabraClave', required: false, description: 'Palabra clave (parcial)' })
  @ApiQuery({ name: 'tipo', required: false, description: 'Tipo de publicación' })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('titulo') titulo?: string,
    @Query('estado') estado?: string,
    @Query('autor') autor?: string,
    @Query('palabraClave') palabraClave?: string,
    @Query('tipo') tipo?: string,
  ) {
    return this.publicationsService.findAllAdvanced({ page, limit, titulo, estado, autor, palabraClave, tipo });
  }

  @Get('my-publications')
  @ApiOperation({ summary: 'Obtener mis publicaciones' })
  @ApiQuery({ name: 'page', required: false, description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, description: 'Elementos por página' })
  findMyPublications(
    @CurrentUser() user: User,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.publicationsService.findByAuthor(user.id, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener publicación por ID' })
  @ApiResponse({ status: 200, description: 'Publicación encontrada' })
  @ApiResponse({ status: 404, description: 'Publicación no encontrada' })
  findOne(@Param('id') id: string) {
    return this.publicationsService.findOne(id);
  }

  @Patch(':id')
  @Roles('ROLE_AUTOR', 'ROLE_EDITOR', 'ROLE_ADMIN')
  @ApiOperation({ summary: 'Actualizar publicación' })
  @ApiResponse({ status: 200, description: 'Publicación actualizada' })
  @ApiResponse({ status: 403, description: 'Sin permisos para editar' })
  @ApiResponse({ status: 404, description: 'Publicación no encontrada' })
  async update(
    @Param('id') id: string,
    @Body() updatePublicationDto: UpdatePublicationDto,
    @CurrentUser() user: User,
  ) {
    const updated = await this.publicationsService.update(id, updatePublicationDto, user);
    await this.auditService.log(user.id, 'ACTUALIZAR_PUBLICACION', { id, cambios: updatePublicationDto });
    return updated;
  }

  @Post(':id/submit-review')
  @Roles('ROLE_AUTOR', 'ROLE_EDITOR', 'ROLE_ADMIN')
  @ApiOperation({ summary: 'Enviar publicación a revisión' })
  @ApiResponse({ status: 200, description: 'Publicación enviada a revisión' })
  @ApiResponse({ status: 403, description: 'Sin permisos o estado inválido' })
  async submitForReview(@Param('id') id: string, @CurrentUser() user: User) {
    const pub = await this.publicationsService.submitForReview(id, user);
    await this.auditService.log(user.id, 'ENVIAR_A_REVISION', { id });
    return pub;
  }

  @Delete(':id')
  @Roles('ROLE_AUTOR', 'ROLE_EDITOR', 'ROLE_ADMIN')
  @ApiOperation({ summary: 'Eliminar publicación' })
  @ApiResponse({ status: 200, description: 'Publicación eliminada' })
  @ApiResponse({ status: 403, description: 'Sin permisos para eliminar' })
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    await this.publicationsService.remove(id, user);
    await this.auditService.log(user.id, 'ELIMINAR_PUBLICACION', { id });
    return { message: 'Publicación eliminada' };
  }
  @Patch(':id/estado')
  @Roles('ROLE_EDITOR', 'ROLE_ADMIN')
  @ApiOperation({ summary: 'Cambiar el estado de una publicación (solo editor/admin)' })
  @ApiResponse({ status: 200, description: 'Estado de la publicación actualizado' })
  @ApiResponse({ status: 403, description: 'Sin permisos para cambiar estado' })
  @ApiResponse({ status: 404, description: 'Publicación no encontrada' })
  async updateEstado(
    @Param('id') id: string,
    @Body('estado') estado: string,
    @CurrentUser() user: User,
  ) {
    const pub = await this.publicationsService.cambiarEstado(id, estado, user);
    await this.auditService.log(user.id, 'CAMBIAR_ESTADO_PUBLICACION', { id, estado });
    return pub;
  }
}
