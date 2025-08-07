import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogPublication } from './catalog-publication.entity';
import { CatalogService } from './catalog.service';
import { CatalogController } from './catalog.controller';
import { CatalogListenerProvider } from './catalog-listener.provider';

@Module({
  imports: [TypeOrmModule.forFeature([CatalogPublication])],
  providers: [CatalogService, CatalogListenerProvider],
  controllers: [CatalogController],
  exports: [CatalogService],
})
export class CatalogModule {}
