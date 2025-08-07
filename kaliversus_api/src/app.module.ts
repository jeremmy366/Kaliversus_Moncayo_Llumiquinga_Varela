import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PublicationsModule } from './publications/publications.module';
import { ReviewsModule } from './reviews/reviews.module';
import { HealthModule } from './health/health.module';
import { NotificationsModule } from './notifications/notifications.module';
import { CatalogController } from './catalog.controller';
// import { AdminController } from './admin/admin.controller';
import { AuditLog } from './entities/audit-log.entity';
import { AuditModule } from './audit/audit.module';
import { MetricsModule } from './metrics/metrics.module';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => 
        configService.get('database') as TypeOrmModuleOptions,
    }),
    HealthModule,
    AuthModule,
    UsersModule,
    PublicationsModule,
    ReviewsModule,
    NotificationsModule,
    MetricsModule,
    AuditModule,
    AdminModule,
  ],
  controllers: [AppController, CatalogController],
  providers: [AppService],
})
export class AppModule {}
