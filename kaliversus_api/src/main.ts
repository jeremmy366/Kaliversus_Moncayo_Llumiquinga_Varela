import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { traceIdFormat } from './tracing/trace-id.format';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            traceIdFormat(),
            winston.format.timestamp(),
            winston.format.colorize(),
            winston.format.printf(({ level, message, timestamp, context, traceId }) => {
              return `[${timestamp}] [${level}]${context ? ' [' + context + ']' : ''}${traceId ? ' [traceId:' + traceId + ']' : ''}: ${message}`;
            })
          ),
        }),
      ],
    }),
  });


  // Seguridad: Helmet
  app.use(helmet());

  // Rate limiting
  app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // máximo 100 requests por IP
    standardHeaders: true,
    legacyHeaders: false,
  }));

  // Configuración global de validación
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Configuración de CORS
  app.enableCors({
    origin: process.env.NODE_ENV === 'production' ? ['https://yourdomain.com'] : true,
    credentials: true,
  });

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Kaliversus API')
    .setDescription('API para gestión de publicaciones académicas')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Health', 'Endpoints de estado del sistema')
    .addTag('Autenticación', 'Endpoints de registro y login')
    .addTag('Usuarios', 'Gestión de usuarios')
    .addTag('Publicaciones', 'Gestión de publicaciones académicas')
    .addTag('Revisiones', 'Sistema de peer review')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT || 8080;
  await app.listen(port, '0.0.0.0');
  const publicUrl = process.env.RAILWAY_PUBLIC_URL || `http://localhost:${port}`;
  console.log(`🚀 Aplicación corriendo en: ${publicUrl}`);
  console.log(`📚 Documentación Swagger: ${publicUrl}/api/docs`);
}

bootstrap();
