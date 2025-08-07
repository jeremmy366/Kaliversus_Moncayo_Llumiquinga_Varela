import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { UserRole } from '../common/enums';

@Entity({ schema: 'auth', name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  nombres: string;

  @Column({ length: 100 })
  apellidos: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ name: 'password_hash' })
  @Exclude()
  passwordHash: string;

  @Column({ length: 100, nullable: true })
  afiliacion?: string;

  @Column({ length: 50, nullable: true })
  orcid?: string;

  @Column('text', { nullable: true })
  biografia?: string;

  @Column({ name: 'foto_url', type: 'text', nullable: true })
  fotoUrl?: string;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_actualizacion' })
  fechaActualizacion: Date;

  @ManyToMany('Role')
  @JoinTable({
    name: 'user_roles',
    schema: 'auth',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: any[];

  @OneToMany('Publication', 'autorPrincipal')
  publicacionesPrincipales: any[];

  @ManyToMany('Publication', 'coautores')
  coautorias: any[];

  @OneToMany('Review', 'revisor')
  revisiones: any[];

  // Método helper para verificar roles
  hasRole(role: UserRole | string): boolean {
    if (!this.roles) return false;
    return this.roles.some(r =>
      (typeof r === 'string' && r === role) ||
      (typeof r === 'object' && r.nombre === role)
    );
  }

  // Método helper para obtener nombre completo
  get nombreCompleto(): string {
    return `${this.nombres} ${this.apellidos}`;
  }
}
