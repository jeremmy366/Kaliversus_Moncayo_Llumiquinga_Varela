import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { EstadoRevision } from '../common/enums';

@Entity({ schema: 'pub', name: 'revisiones' })
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: EstadoRevision,
    default: EstadoRevision.PENDIENTE,
  })
  estado: EstadoRevision;

  @Column('text', { nullable: true })
  comentarios?: string;

  @Column('jsonb', { nullable: true, name: 'historial_cambios' })
  historialCambios?: Record<string, any>;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_actualizacion' })
  fechaActualizacion: Date;

  // Relaciones
  @ManyToOne('Publication', 'revisiones', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'publicacion_id' })
  publicacion: any;

  @Column({ name: 'publicacion_id', type: 'uuid' })
  publicacionId: string;

  @ManyToOne('User', 'revisiones')
  @JoinColumn({ name: 'revisor_id' })
  revisor: any;

  @Column({ name: 'revisor_id', type: 'uuid' })
  revisorId: string;
}
