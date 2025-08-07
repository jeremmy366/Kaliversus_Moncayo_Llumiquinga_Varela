import { Injectable, NotFoundException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Publication, User } from '../entities';
import { CreatePublicationDto } from './dto/create-publication.dto';
import { UpdatePublicationDto } from './dto/update-publication.dto';
import { EstadoPublicacion, UserRole } from '../common/enums';
import { PublicationEventsService } from './publication-events.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class PublicationsService {
  constructor(
    @InjectRepository(Publication)
    private readonly publicationRepository: Repository<Publication>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly publicationEventsService: PublicationEventsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(createPublicationDto: CreatePublicationDto, authorId: string): Promise<Publication> {
    const { coautoresIds, ...publicationData } = createPublicationDto;
    
    // Buscar coautores si se proporcionaron
    let coautores: any[] = [];
    if (coautoresIds && coautoresIds.length > 0) {
      coautores = await this.userRepository.find({
        where: coautoresIds.map(id => ({ id }))
      });
    }

    const publication = this.publicationRepository.create({
      ...publicationData,
      autorPrincipalId: authorId,
      coautores,
    });

    return this.publicationRepository.save(publication);
  }

  async findAllAdvanced({
    page = 1,
    limit = 10,
    titulo,
    estado,
    autor,
    palabraClave,
    tipo,
  }: {
    page?: number;
    limit?: number;
    titulo?: string;
    estado?: string;
    autor?: string;
    palabraClave?: string;
    tipo?: string;
  }): Promise<{ publications: Publication[], total: number }> {
    const query = this.publicationRepository.createQueryBuilder('publication')
      .leftJoinAndSelect('publication.autorPrincipal', 'autorPrincipal')
      .leftJoinAndSelect('publication.coautores', 'coautores');

    if (titulo) {
      query.andWhere('LOWER(publication.titulo) LIKE LOWER(:titulo)', { titulo: `%${titulo}%` });
    }
    if (estado) {
      query.andWhere('publication.estado = :estado', { estado });
    }
    if (autor) {
      query.andWhere('publication.autorPrincipalId = :autor', { autor });
    }
    if (palabraClave) {
      query.andWhere(':palabraClave = ANY(publication.palabrasClave)', { palabraClave });
    }
    if (tipo) {
      query.andWhere('publication.tipo = :tipo', { tipo });
    }

    query.skip((page - 1) * limit).take(limit).orderBy('publication.fechaCreacion', 'DESC');
    const [publications, total] = await query.getManyAndCount();
    return { publications, total };
  }

  async findByAuthor(authorId: string, page: number = 1, limit: number = 10) {
    const [publications, total] = await this.publicationRepository.findAndCount({
      where: [
        { autorPrincipalId: authorId },
        { coautores: { id: authorId } }
      ],
      relations: ['autorPrincipal', 'coautores'],
      skip: (page - 1) * limit,
      take: limit,
      order: { fechaCreacion: 'DESC' },
    });

    return { publications, total };
  }

  async findOne(id: string): Promise<Publication> {
    const publication = await this.publicationRepository.findOne({
      where: { id },
      relations: ['autorPrincipal', 'coautores', 'revisiones'],
    });

    if (!publication) {
      throw new NotFoundException('Publicación no encontrada');
    }

    return publication;
  }

  async update(id: string, updatePublicationDto: UpdatePublicationDto, user: User): Promise<Publication> {
    const publication = await this.findOne(id);

    // Verificar permisos de edición
    this.checkEditPermissions(publication, user);

    // Verificar que la publicación puede ser editada
    if (!publication.isEditable()) {
      throw new ForbiddenException('La publicación no puede ser editada en su estado actual');
    }

    const { coautoresIds, ...updateData } = updatePublicationDto;

    // Actualizar coautores si se proporcionaron
    if (coautoresIds !== undefined) {
      const coautores = coautoresIds.length > 0 
        ? await this.userRepository.find({
            where: coautoresIds.map(id => ({ id }))
          })
        : [];
      publication.coautores = coautores;
    }

    // Guardar estado anterior para detectar transición a PUBLICADO
    const estadoAnterior = publication.estado;

    // Actualizar otros campos
    Object.assign(publication, updateData);

    // Incrementar versión si hay cambios significativos
    if (estadoAnterior === EstadoPublicacion.CAMBIOS_SOLICITADOS) {
      publication.versionActual += 1;
      publication.estado = EstadoPublicacion.BORRADOR;
    }

    const saved = await this.publicationRepository.save(publication);

    // Emitir evento si la publicación pasa a PUBLICADO
    if (estadoAnterior !== EstadoPublicacion.PUBLICADO && saved.estado === EstadoPublicacion.PUBLICADO) {
      // Mapear solo los campos públicos
      const event = {
        id: saved.id,
        titulo: saved.titulo,
        autorPrincipal: saved.autorPrincipal?.nombreCompleto || saved.autorPrincipalId,
        coautores: saved.coautores?.map((c: any) => c.nombreCompleto || c.id) || [],
        resumen: saved.resumen,
        tipo: saved.tipo,
        palabrasClave: saved.palabrasClave,
        urlArchivo: saved.metadatos?.urlArchivo || null,
      };
      await this.publicationEventsService.emitPublicationPublished(event);
      // Emitir notificación SSE a todos
      await this.notificationsService.create(
        `Nueva publicación aprobada: ${saved.titulo}`,
        saved.autorPrincipalId,
        'PUBLICACION_APROBADA',
        saved.id
      );
    }

    return saved;
  }

  async submitForReview(id: string, user: User): Promise<Publication> {
    const publication = await this.findOne(id);

    // Verificar permisos
    this.checkEditPermissions(publication, user);

    // Verificar que puede ser enviada a revisión
    if (!publication.canSubmitForReview()) {
      throw new ForbiddenException('La publicación no puede ser enviada a revisión en su estado actual');
    }

    publication.estado = EstadoPublicacion.EN_REVISION;
    return this.publicationRepository.save(publication);
  }

  async remove(id: string, user: User): Promise<void> {
    const publication = await this.findOne(id);

    // Solo el autor principal o un admin pueden eliminar
    if (publication.autorPrincipalId !== user.id && !user.hasRole(UserRole.ADMIN)) {
      throw new ForbiddenException('No tienes permisos para eliminar esta publicación');
    }

    // Solo se pueden eliminar borradores
    if (publication.estado !== EstadoPublicacion.BORRADOR) {
      throw new ForbiddenException('Solo se pueden eliminar publicaciones en estado borrador');
    }

    await this.publicationRepository.remove(publication);
  }

  private checkEditPermissions(publication: Publication, user: User): void {
    const isAuthor = publication.autorPrincipalId === user.id;
    const isCoauthor = publication.coautores?.some(coautor => coautor.id === user.id);
    const isAdmin = user.hasRole(UserRole.ADMIN);

    if (!isAuthor && !isCoauthor && !isAdmin) {
      throw new ForbiddenException('No tienes permisos para editar esta publicación');
    }
  }
  async cambiarEstado(id: string, estado: string, user: User): Promise<Publication> {
    const publication = await this.findOne(id);
    // Solo editor o admin pueden cambiar el estado
    const isEditor = user.hasRole(UserRole.EDITOR);
    const isAdmin = user.hasRole(UserRole.ADMIN);
    if (!isEditor && !isAdmin) {
      throw new ForbiddenException('No tienes permisos para cambiar el estado de esta publicación');
    }
    // Validar que el estado sea válido
    if (!(estado in EstadoPublicacion)) {
      throw new ForbiddenException('Estado de publicación no válido');
    }
    publication.estado = EstadoPublicacion[estado as keyof typeof EstadoPublicacion];
    return this.publicationRepository.save(publication);
  }
}
