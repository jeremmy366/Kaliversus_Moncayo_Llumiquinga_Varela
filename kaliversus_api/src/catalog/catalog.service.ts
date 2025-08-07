import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CatalogPublication } from './catalog-publication.entity';

@Injectable()
export class CatalogService {
  constructor(
    @InjectRepository(CatalogPublication)
    private readonly catalogRepo: Repository<CatalogPublication>,
  ) {}


  async findAllAdvanced({
    titulo,
    autor,
    tipo,
    palabraClave,
    coautor,
    resumen,
    fechaInicio,
    fechaFin,
    page = 1,
    limit = 10,
  }: {
    titulo?: string;
    autor?: string;
    tipo?: string;
    palabraClave?: string;
    coautor?: string;
    resumen?: string;
    fechaInicio?: string;
    fechaFin?: string;
    page?: number;
    limit?: number;
  }): Promise<{ results: CatalogPublication[]; total: number }> {
    const qb = this.catalogRepo.createQueryBuilder('pub');
    if (titulo) {
      qb.andWhere('LOWER(pub.titulo) LIKE LOWER(:titulo)', { titulo: `%${titulo}%` });
    }
    if (autor) {
      qb.andWhere('LOWER(pub.autorPrincipal) LIKE LOWER(:autor)', { autor: `%${autor}%` });
    }
    if (tipo) {
      qb.andWhere('pub.tipo = :tipo', { tipo });
    }
    if (palabraClave) {
      // Permitir búsqueda por varias palabras clave separadas por coma
      const palabras = palabraClave.split(',').map(p => p.trim().toLowerCase());
      for (const palabra of palabras) {
        qb.andWhere('LOWER(pub.palabrasClave) LIKE :palabraClave', { palabraClave: `%${palabra}%` });
      }
    }
    if (coautor) {
      qb.andWhere('LOWER(pub.coautores) LIKE :coautor', { coautor: `%${coautor.toLowerCase()}%` });
    }
    if (resumen) {
      qb.andWhere('LOWER(pub.resumen) LIKE :resumen', { resumen: `%${resumen.toLowerCase()}%` });
    }
    if (fechaInicio) {
      qb.andWhere('pub.createdAt >= :fechaInicio', { fechaInicio });
    }
    if (fechaFin) {
      qb.andWhere('pub.createdAt <= :fechaFin', { fechaFin });
    }
    qb.orderBy('pub.createdAt', 'DESC');
    qb.skip((page - 1) * limit).take(limit);
    const [results, total] = await qb.getManyAndCount();
    return { results, total };
  }

  async saveOrUpdateFromEvent(data: any) {
    // Mapear solo los campos válidos de CatalogPublication
    const mapped: Partial<CatalogPublication> = {
      id: data.id,
      titulo: data.titulo,
      autorPrincipal: data.autorPrincipal,
      coautores: data.coautores,
      resumen: data.resumen,
      tipo: data.tipo,
      palabrasClave: data.palabrasClave,
      urlArchivo: data.urlArchivo,
    };
    let pub = await this.catalogRepo.findOne({ where: { id: mapped.id } });
    if (!pub) {
      pub = this.catalogRepo.create(mapped);
    } else {
      Object.assign(pub, mapped);
    }
    return this.catalogRepo.save(pub);
  }
}
