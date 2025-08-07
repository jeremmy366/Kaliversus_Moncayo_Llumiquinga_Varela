import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { Publication } from '../entities/publication.entity';
import { Review } from '../entities/review.entity';
import { Notification } from '../entities/notification.entity';
import { AuditLog } from '../entities/audit-log.entity';

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => {
    if (process.env.DATABASE_URL) {
      return {
        type: 'postgres',
        url: process.env.DATABASE_URL,
        entities: [User, Role, Publication, Review, Notification, AuditLog],
        synchronize: false,
        logging: process.env.NODE_ENV === 'development',
        ssl: { rejectUnauthorized: false },
        extra: {
          connectTimeoutMS: 10000,
        },
      };
    }
    return {
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'publicaciones_db',
      entities: [User, Role, Publication, Review, Notification, AuditLog],
      synchronize: false,
      logging: process.env.NODE_ENV === 'development',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    };
  },
);
