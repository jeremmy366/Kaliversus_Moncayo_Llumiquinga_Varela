import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { EstadoPublicacion, TipoPublicacion } from '../common/enums';

@Entity({ schema: 'pub', name: 'publicaciones' })
export class Publication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  titulo: string;

  @Column('text', { nullable: true })
  resumen?: string;

  @Column('text', { array: true, nullable: true, name: 'palabras_clave' })
  palabrasClave?: string[];

  @Column({
    type: 'enum',
    enum: EstadoPublicacion,
    default: EstadoPublicacion.BORRADOR,
  })
  estado: EstadoPublicacion;

  @Column({ name: 'version_actual', default: 1 })
  versionActual: number;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_actualizacion' })
  fechaActualizacion: Date;

  @Column({
    type: 'enum',
    enum: TipoPublicacion,
  })
  tipo: TipoPublicacion;

  @Column('jsonb', { nullable: true })
  metadatos?: Record<string, any>;

  // Relaciones
  @ManyToOne('User', 'publicacionesPrincipales')
  @JoinColumn({ name: 'autor_principal_id' })
  autorPrincipal: any;

  @Column({ name: 'autor_principal_id', type: 'uuid' })
  autorPrincipalId: string;

  @ManyToMany('User', 'coautorias')
  @JoinTable({
    name: 'coautores_publicacion',
    schema: 'pub',
    joinColumn: { name: 'publicacion_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'autor_id', referencedColumnName: 'id' },
  })
  coautores: any[];

  @OneToMany('Review', 'publicacion')
  revisiones: any[];

  // Métodos helper
  isEditable(): boolean {
    return [EstadoPublicacion.BORRADOR, EstadoPublicacion.CAMBIOS_SOLICITADOS].includes(this.estado);
  }

  canSubmitForReview(): boolean {
    return this.estado === EstadoPublicacion.BORRADOR;
  }

  isPublished(): boolean {
    return this.estado === EstadoPublicacion.PUBLICADO;
  }
}
