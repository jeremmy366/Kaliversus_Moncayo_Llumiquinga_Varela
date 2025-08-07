import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { User } from '../entities/user.entity';

@Entity({ schema: 'notif', name: 'notificaciones' })
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  mensaje: string;

  @Column({ default: false })
  leida: boolean;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @Column({ nullable: true })
  tipo: string; // ejemplo: 'REVIEW_ASSIGNED', 'PUBLICATION_STATUS_CHANGED'

  @Column({ name: 'referencia_id', nullable: true })
  referenciaId: string; // id de la publicación o revisión relacionada
}
