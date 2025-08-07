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
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { AssignReviewerDto } from './dto/assign-reviewer.dto';
import { CreateSuggestionDto } from './dto/create-suggestion.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../entities';

@ApiTags('Revisiones')
@Controller('reviews')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @Roles('EDITOR', 'ADMIN')
  @ApiOperation({ summary: 'Crear nueva revisión (solo editores/admins)' })
  @ApiResponse({ status: 201, description: 'Revisión creada exitosamente' })
  create(@Body() createReviewDto: CreateReviewDto, @CurrentUser() user: User) {
    return this.reviewsService.create(createReviewDto, user);
  }

  @Post('publications/:publicacionId/assign-reviewer')
  @Roles('EDITOR', 'ADMIN')
  @ApiOperation({ summary: 'Asignar revisor a una publicación' })
  assignReviewer(
    @Param('publicacionId') publicacionId: string,
    @Body() assignReviewerDto: AssignReviewerDto,
    @CurrentUser() user: User,
  ) {
    return this.reviewsService.assignReviewer(publicacionId, assignReviewerDto, user);
  }

  @Get()
  @Roles('ADMIN', 'EDITOR')
  @ApiOperation({ summary: 'Obtener todas las revisiones' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.reviewsService.findAll(page, limit);
  }

  @Get('publications/:publicacionId')
  @ApiOperation({ summary: 'Obtener revisiones de una publicación específica' })
  findByPublication(@Param('publicacionId') publicacionId: string) {
    return this.reviewsService.findByPublication(publicacionId);
  }

  @Get('my-reviews')
  @Roles('REVISOR', 'ADMIN')
  @ApiOperation({ summary: 'Obtener mis revisiones asignadas' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findMyReviews(
    @CurrentUser() user: User,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.reviewsService.findByReviewer(user.id, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener revisión por ID' })
  findOne(@Param('id') id: string) {
    return this.reviewsService.findOne(id);
  }

  @Patch(':id')
  @Roles('REVISOR', 'ADMIN')
  @ApiOperation({ summary: 'Actualizar revisión (solo revisor asignado o admin)' })
  update(
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateReviewDto,
    @CurrentUser() user: User,
  ) {
    return this.reviewsService.update(id, updateReviewDto, user);
  }

  @Delete(':id')
  @Roles('EDITOR', 'ADMIN')
  @ApiOperation({ summary: 'Eliminar revisión (solo editores/admins)' })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.reviewsService.remove(id, user);
  }

  @Post('sugerencia')
  @ApiOperation({ summary: 'Dejar sugerencia/comentario externo sobre una publicación (no requiere ser revisor asignado)' })
  @ApiResponse({ status: 201, description: 'Sugerencia registrada correctamente' })
  async createSuggestion(
    @Body() createSuggestionDto: CreateSuggestionDto,
    @CurrentUser() user: User,
  ) {
    return this.reviewsService.createSuggestion(createSuggestionDto, user);
  }
}
