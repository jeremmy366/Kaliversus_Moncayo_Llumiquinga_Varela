# Kaliversus Frontend

> Plataforma web para consulta y gestión de publicaciones académicas.

---

## 📑 Tabla de Contenido

- [Descripción](#descripción)
- [Estructura de Carpetas](#estructura-de-carpetas)
- [Instrucciones de Despliegue](#instrucciones-de-despliegue)
- [Diagrama de Arquitectura](#diagrama-de-arquitectura)
- [Tecnologías](#tecnologías)
- [Créditos](#créditos)

---

## Descripción

Kaliversus Frontend es una SPA desarrollada en React + Vite para explorar, buscar y visualizar publicaciones académicas, con integración a un backend REST y una experiencia moderna para usuarios lectores y administradores.

## Estructura de Carpetas

```
kaliversus_front/
├── public/                # Archivos estáticos
├── src/
│   ├── assets/            # Imágenes y recursos
│   ├── components/        # Componentes reutilizables (UI)
│   ├── pages/             # Vistas principales (Dashboard, Catálogo, etc)
│   ├── services/          # Lógica de acceso a APIs
│   ├── App.jsx            # Componente raíz
│   └── main.jsx           # Entry point
├── package.json
├── vite.config.js
└── README.md
```

## Instrucciones de Despliegue

### Requisitos Previos

- Node.js >= 18.x
- npm >= 9.x
- (Opcional) Backend/API configurado

### Instalación y Ejecución Local

1. Clona este repositorio:
   ```bash
   git clone <URL-del-repo>
   cd kaliversus_front
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. (Opcional) Configura `.env` para la URL de la API backend.
4. Inicia la app:
   ```bash
   npm run dev
   ```
5. Accede a [http://localhost:5173](http://localhost:5173)

### Despliegue en Producción

1. Genera la build:
   ```bash
   npm run build
   ```
2. Sirve la carpeta `dist`:
   ```bash
   npm run preview
   ```
   O sube el contenido de `dist` a Vercel, Netlify, nginx, etc.

## Diagrama de Arquitectura

```mermaid
flowchart LR
  subgraph Usuario
    U[Usuario Web]
  end
  subgraph Frontend
    F[SPA React (Vite)]
  end
  subgraph Backend
    B[API REST Kaliversus]
    DB[(Base de Datos SQL)]
  end
  subgraph CDN
    CDN[CDN / Archivos Estáticos]
  end

  U -- HTTP/HTTPS --> F
  F -- API REST --> B
  B -- ORM/SQL --> DB
  F -- Assets --> CDN
```

**Explicación:**

- El usuario accede al frontend (SPA React) servido por Vite.
- El frontend consume la API REST del backend para datos de publicaciones, usuarios, etc.
- El backend accede a la base de datos relacional.
- Los assets estáticos pueden servirse desde un CDN.

## Tecnologías

- **Frontend:** React 19, Vite, Tailwind CSS, React Router, Heroicons
- **Backend:** API REST (ver documentación backend)
- **Base de Datos:** SQL (PostgreSQL, MySQL, etc)
- **Despliegue:** Vercel, Netlify, nginx, etc

## Créditos

- Equipo Kaliversus
- Desarrolladores: [Tu nombre aquí]
- Diseño UI: [Nombre si aplica]

---
