import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review, Publication, User } from '../entities';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { AssignReviewerDto } from './dto/assign-reviewer.dto';
import { EstadoRevision, EstadoPublicacion, UserRole } from '../common/enums';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(Publication)
    private readonly publicationRepository: Repository<Publication>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(createReviewDto: CreateReviewDto, currentUser: any): Promise<Review> {
    // Verificar que solo editores o admins pueden crear revisiones
    if (!currentUser.hasRole(UserRole.EDITOR) && !currentUser.hasRole(UserRole.ADMIN)) {
      throw new ForbiddenException('Solo editores y administradores pueden asignar revisores');
    }

    const { publicacionId, revisorId, ...reviewData } = createReviewDto;

    // Verificar que la publicación existe y está en estado de revisión
    const publication = await this.publicationRepository.findOne({
      where: { id: publicacionId }
    });

    if (!publication) {
      throw new NotFoundException('Publicación no encontrada');
    }

    if (publication.estado !== EstadoPublicacion.EN_REVISION) {
      throw new BadRequestException('La publicación debe estar en estado EN_REVISION para asignar revisores');
    }

    // Verificar que el revisor existe y tiene el rol correcto
    const reviewer = await this.userRepository.findOne({
      where: { id: revisorId },
      relations: ['roles']
    });

    if (!reviewer) {
      throw new NotFoundException('Revisor no encontrado');
    }

    if (!reviewer.roles?.some(role => role.nombre === UserRole.REVISOR)) {
      throw new BadRequestException('El usuario debe tener el rol REVISOR');
    }

    // Verificar que no existe ya una revisión activa para esta publicación y revisor
    const existingReview = await this.reviewRepository.findOne({
      where: {
        publicacionId,
        revisorId,
        estado: EstadoRevision.PENDIENTE
      }
    });

    if (existingReview) {
      throw new BadRequestException('Ya existe una revisión pendiente para este revisor y publicación');
    }

    // Crear la revisión
    const review = this.reviewRepository.create({
      ...reviewData,
      publicacionId,
      revisorId,
      estado: EstadoRevision.PENDIENTE,
      historialCambios: {
        ...reviewData.historialCambios,
        assignedBy: currentUser.id,
        assignedAt: new Date().toISOString(),
      }
    });

    const savedReview = await this.reviewRepository.save(review);
    // Notificar al revisor asignado
    await this.notificationsService.create(
      `Se te ha asignado una revisión para la publicación "${publication.titulo}"`,
      revisorId,
      'REVIEW_ASSIGNED',
      publicacionId
    );
    return savedReview;
  }

  async assignReviewer(publicacionId: string, assignReviewerDto: AssignReviewerDto, currentUser: any): Promise<Review> {
    return this.create({
      publicacionId: publicacionId,
      revisorId: assignReviewerDto.revisorId,
      comentarios: 'Revisor asignado por ' + currentUser.nombreCompleto,
      historialCambios: {
        action: 'reviewer_assigned',
        assignedBy: currentUser.id,
        assignedAt: new Date().toISOString()
      }
    }, currentUser);
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ reviews: Review[], total: number }> {
    const [reviews, total] = await this.reviewRepository.findAndCount({
      relations: ['publicacion', 'revisor'],
      skip: (page - 1) * limit,
      take: limit,
      order: { fechaCreacion: 'DESC' },
    });

    return { reviews, total };
  }

  async findByPublication(publicacionId: string): Promise<Review[]> {
    return this.reviewRepository.find({
      where: { publicacionId },
      relations: ['revisor'],
      order: { fechaCreacion: 'ASC' },
    });
  }

  async findByReviewer(reviewerId: string, page: number = 1, limit: number = 10): Promise<{ reviews: Review[], total: number }> {
    const [reviews, total] = await this.reviewRepository.findAndCount({
      where: { revisorId: reviewerId },
      relations: ['publicacion'],
      skip: (page - 1) * limit,
      take: limit,
      order: { fechaCreacion: 'DESC' },
    });

    return { reviews, total };
  }

  async findOne(id: string): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ['publicacion', 'revisor'],
    });

    if (!review) {
      throw new NotFoundException('Revisión no encontrada');
    }

    return review;
  }

  async update(id: string, updateReviewDto: UpdateReviewDto, currentUser: any): Promise<Review> {
    const review = await this.findOne(id);

    // Verificar permisos: solo el revisor asignado puede actualizar
    if (review.revisorId !== currentUser.id && !currentUser.hasRole(UserRole.ADMIN)) {
      throw new ForbiddenException('Solo el revisor asignado o un administrador puede actualizar esta revisión');
    }

    // Actualizar historial de cambios
    const updatedHistorial = {
      ...review.historialCambios,
      ...updateReviewDto.historialCambios,
      lastUpdatedBy: currentUser.id,
      lastUpdatedAt: new Date().toISOString(),
    };

    Object.assign(review, {
      ...updateReviewDto,
      historialCambios: updatedHistorial,
    });

    const updatedReview = await this.reviewRepository.save(review);

    // Si la revisión fue completada, verificar si se puede cambiar el estado de la publicación
    if (updateReviewDto.estado && [EstadoRevision.ACEPTADA, EstadoRevision.RECHAZADA].includes(updateReviewDto.estado)) {
      await this.checkPublicationStatus(review.publicacionId);
    }

    return updatedReview;
  }

  async remove(id: string, currentUser: any): Promise<void> {
    const review = await this.findOne(id);

    // Solo editores y admins pueden eliminar revisiones
    if (!currentUser.hasRole(UserRole.EDITOR) && !currentUser.hasRole(UserRole.ADMIN)) {
      throw new ForbiddenException('Solo editores y administradores pueden eliminar revisiones');
    }

    await this.reviewRepository.remove(review);
  }

  private async checkPublicationStatus(publicacionId: string): Promise<void> {
    // Obtener todas las revisiones de la publicación
    const reviews = await this.reviewRepository.find({
      where: { publicacionId }
    });

    const pendingReviews = reviews.filter(r => r.estado === EstadoRevision.PENDIENTE || r.estado === EstadoRevision.EN_PROCESO);
    const acceptedReviews = reviews.filter(r => r.estado === EstadoRevision.ACEPTADA);
    const rejectedReviews = reviews.filter(r => r.estado === EstadoRevision.RECHAZADA);

    // Si no hay revisiones pendientes y hay al menos una revisión
    if (pendingReviews.length === 0 && reviews.length > 0) {
      const publication = await this.publicationRepository.findOne({
        where: { id: publicacionId },
        relations: ['autorPrincipal']
      });

      if (publication) {
        // Si hay revisiones rechazadas, solicitar cambios
        if (rejectedReviews.length > 0) {
          publication.estado = EstadoPublicacion.CAMBIOS_SOLICITADOS;
          await this.publicationRepository.save(publication);
          // Notificar al autor principal
          if (publication.autorPrincipal?.id) {
            await this.notificationsService.create(
              `Tu publicación "${publication.titulo}" requiere cambios tras la revisión`,
              publication.autorPrincipal.id,
              'PUBLICATION_STATUS_CHANGED',
              publicacionId
            );
          }
        }
        // Si todas las revisiones están aceptadas, aprobar
        else if (acceptedReviews.length > 0 && rejectedReviews.length === 0) {
          publication.estado = EstadoPublicacion.APROBADO;
          await this.publicationRepository.save(publication);
          // Notificar al autor principal
          if (publication.autorPrincipal?.id) {
            await this.notificationsService.create(
              `¡Felicidades! Tu publicación "${publication.titulo}" ha sido aprobada tras la revisión`,
              publication.autorPrincipal.id,
              'PUBLICATION_STATUS_CHANGED',
              publicacionId
            );
          }
        }
      }
    }
  }
  /**
   * Permite a un revisor o admin dejar una sugerencia/comentario sobre una publicación,
   * aunque no sea el revisor asignado. Guarda como revisión con estado SUGERENCIA.
   */
  async createSuggestion(createSuggestionDto: any, currentUser: any): Promise<any> {
    console.log('DTO recibido en createSuggestion:', createSuggestionDto);
    const { publicacionId, comentarios } = createSuggestionDto;

    // Verificar que la publicación existe
    const publication = await this.publicationRepository.findOne({ where: { id: publicacionId } });
    console.log('Publicación encontrada:', publication);
    if (!publication) {
      throw new NotFoundException('Publicación no encontrada');
    }

    // Permitir solo a revisores o admins
    if (!currentUser.hasRole(UserRole.REVISOR) && !currentUser.hasRole(UserRole.ADMIN)) {
      throw new ForbiddenException('Solo revisores o administradores pueden dejar sugerencias');
    }

    // Guardar como revisión con estado especial SUGERENCIA
    const review = this.reviewRepository.create({
      publicacionId,
      revisorId: currentUser.id,
      comentarios: comentarios,
      estado: EstadoRevision.SUGERENCIA,
      historialCambios: {
        suggestedBy: currentUser.id,
        suggestedAt: new Date().toISOString(),
      },
    });
    const saved = await this.reviewRepository.save(review);

    // Notificar al editor o autor principal si se desea (opcional)
    // await this.notificationsService.create(
    //   `Nueva sugerencia/comentario en la publicación "${publication.titulo}"`,
    //   publication.autorPrincipal?.id,
    //   'SUGGESTION_ADDED',
    //   publicacionId
    // );

    return saved;
  }
}
