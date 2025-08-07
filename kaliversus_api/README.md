<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

# Despliegue de Kaliversus API

## Instrucciones de despliegue

1. **Clona el repositorio y entra al directorio:**
   ```bash
   git clone <REPO_URL>

# Despliegue de Kaliversus API

## Instrucciones de despliegue

1. Clona el repositorio y entra al directorio:
   ```bash
   git clone <REPO_URL>
   cd kaliversus_api
   ```
2. Instala dependencias:
   ```bash
   npm install
   ```
3. Configura las variables de entorno:
   - Copia el archivo `.env.example` a `.env` y edítalo con tus valores.
   - Puedes usar PostgreSQL o CockroachDB como base de datos principal. Para CockroachDB, configura la variable `DATABASE_URL` en tu `.env` así:
     ```env
     DATABASE_URL=postgresql://<usuario>:<contraseña>@<host>:26257/<nombre_db>?sslmode=require
     ```
   - El sistema detecta automáticamente la base según la variable `DATABASE_URL`.
4. Compila el proyecto:
   ```bash
   npm run build
   ```
5. Inicia la aplicación en producción:
   ```bash
   npm run start:prod
   ```
6. Accede a la documentación Swagger:
   - http://localhost:3000/api/docs

---

## Diagrama de arquitectura

```
-------------------+      +-------------------+      +-------------------+
|   Cliente (Web)   |<---> |   API NestJS      |<---> | PostgreSQL /      |
|                   |      |  (Kaliversus)     |      | CockroachDB       |
+-------------------+      +-------------------+      +-------------------+
         |                        |   ^                        |
         v                        v   |                        v
+-------------------+      +-------------------+      +-------------------+
|   RabbitMQ        |<---->|   Email Worker    |----->|   Resend API      |
+-------------------+      +-------------------+      +-------------------+
```

- API NestJS: Backend principal, expone endpoints REST, SSE y health/metrics.
- PostgreSQL: Base de datos principal.
- RabbitMQ: Broker de eventos para notificaciones y microservicios.
- Email Worker: Microservicio que consume eventos de RabbitMQ y envía emails vía Resend.
- Resend API: Servicio externo de envío de emails.
- Cliente: Frontend o consumidor externo.

---

Para detalles técnicos, endpoints, monitoreo, pruebas y buenas prácticas, consulta `DOCUMENTATION.md`.

---

## CI/CD y despliegue automático

---

## Despliegue con Docker Compose

Puedes levantar toda la infraestructura (API, PostgreSQL, RabbitMQ) localmente o en producción usando el archivo `docker-compose.yml` incluido:

```bash
docker compose up -d --build
```

Esto instalará dependencias, compilará y levantará la API en el puerto 3000, junto con la base de datos y RabbitMQ.

> Personaliza las variables en `.env` y los servicios según tus necesidades.

Este proyecto incluye un workflow de GitHub Actions (`.github/workflows/ci-cd.yml`) que ejecuta:

- Lint, build y pruebas automáticas en cada push/pull request a `main`.
- Migraciones de base de datos antes de correr los tests.
- Despliegue automático a servidor Linux vía SSH y Docker Compose (puedes adaptarlo a tu entorno).

### Ejemplo de despliegue automático

El workflow incluye un job `deploy` que:

1. Copia el código al servidor usando SSH (`appleboy/scp-action`).
2. Ejecuta remotamente `docker compose up -d --build` para levantar la app en el servidor.

**Requisitos:**
- Un servidor Linux con Docker y Docker Compose instalados.
- Variables secretas configuradas en GitHub Actions: `SERVER_HOST`, `SERVER_USER`, `SERVER_SSH_KEY`.

Puedes personalizar el script para Railway, VPS, o cualquier otro proveedor.

> Más detalles y ejemplos en la documentación oficial de [GitHub Actions](https://docs.github.com/en/actions).

---

## Migraciones y respaldo de base de datos

### Migraciones (TypeORM)

1. **Generar una nueva migración:**
   ```bash
   npm run typeorm:migration:generate -- -n NombreDeLaMigracion
   ```
   El archivo se creará en `src/migrations/`.

2. **Ejecutar migraciones pendientes:**
   ```bash
   npm run typeorm:migration:run
   ```

3. **Revertir la última migración:**
   ```bash
   npm run typeorm:migration:revert
   ```

### Respaldo de base de datos (PostgreSQL)

1. **Realizar un respaldo manual:**
   ```bash
   npm run db:backup
   ```
   El archivo de respaldo se guardará como `backup_YYYYMMDD_HHMMSS.dump` en el directorio actual.

> Asegúrate de tener `pg_dump` disponible en tu sistema y la variable `DATABASE_URL` configurada en `.env`.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

---

## Levantar servicios

Para iniciar cada servicio de la aplicación:

- **API principal:**
  ```bash
  npm run start:prod
  ```
- **Email Worker:**
  ```bash
  npm run start:worker
  ```

