import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('catalog_publication')
export class CatalogPublication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  titulo: string;

  @Column()
  autorPrincipal: string;

  @Column('simple-array', { nullable: true })
  coautores: string[];

  @Column({ nullable: true })
  resumen: string;

  @Column({ nullable: true })
  tipo: string;

  @Column({ nullable: true })
  palabrasClave: string;

  @Column({ nullable: true })
  urlArchivo: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
