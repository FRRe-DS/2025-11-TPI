# Stock Management System

Sistema de gestión de stock con backend en Next.js, frontend con autenticación, y base de datos PostgreSQL.

## 🏗️ Estructura del Proyecto

```
apigrupo11/
├── database/               # 🗄️ Configuración de Base de Datos
│   ├── docker-compose.yml # Docker setup para PostgreSQL
│   ├── schema.sql         # Schema de la base de datos
│   ├── init.sh           # Script de inicialización
│   └── README.md         # Guía de base de datos
├── backend/              # 🚀 API Backend (Next.js)
│   ├── src/app/api/     # Endpoints de la API
│   └── src/lib/         # Librerías (auth, database)
└── frontend/            # 🎨 Frontend (Next.js + NextAuth)
    └── src/             # Componentes y páginas
```

## 🚀 Quick Start

### 1. Levantar la Base de Datos

```bash
# Desde la raíz del proyecto
cd apigrupo11/database
docker-compose up -d
```

Esto iniciará:
- **PostgreSQL** en puerto 5432
- **Adminer** (interfaz web) en http://localhost:8080

### 2. Configurar Backend

```bash
# Desde la raíz del proyecto
cd apigrupo11/backend
cp .env.example .env.local
npm install
npm run dev
```

El backend estará disponible en http://localhost:3000

### 3. Configurar Frontend

```bash
# Desde la raíz del proyecto
cd apigrupo11/frontend
npm install  
npm run dev
```

El frontend estará disponible en http://localhost:3001

## 🔗 Servicios

| Servicio | URL | Descripción |
|----------|-----|-------------|
| Backend API | http://localhost:3000 | Endpoints REST para productos, categorías, etc. |
| Frontend | http://localhost:3001 | Interfaz de usuario con autenticación |
| Adminer | http://localhost:8080 | Interfaz web para PostgreSQL |
| PostgreSQL | localhost:5432 | Base de datos |

## 📊 API Endpoints

- `GET /api/productos` - Listar productos
- `POST /api/productos` - Crear producto
- `GET /api/productos/{id}` - Obtener producto específico
- `PATCH /api/productos/{id}` - Actualizar producto
- `DELETE /api/productos/{id}` - Eliminar producto

Ver documentación completa de la API en `/backend/public/openapi.yaml`

## 🗄️ Base de Datos

La base de datos incluye:
- **productos** - Información de productos con JSONB
- **categorias** - Categorías de productos
- **reservas** - Sistema de órdenes/reservas
- **usuarios** - Gestión de usuarios

Ver [`database/README.md`](./database/README.md) para más detalles.

## 🔐 Autenticación

El sistema usa **NextAuth.js** con:
- JWT tokens para la API
- Keycloak para autenticación (opcional)
- Middleware de autenticación en rutas protegidas

Ver [`AUTH_IMPLEMENTATION_SUMMARY.md`](./AUTH_IMPLEMENTATION_SUMMARY.md) para detalles.

## 🛠️ Desarrollo

### Requisitos

- Node.js 18+
- Docker y Docker Compose
- npm o yarn

### Variables de Entorno

1. **Backend** (`backend/.env.local`):
   ```bash
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=stock_management
   DB_USER=postgres
   DB_PASSWORD=password
   NEXTAUTH_SECRET=your-secret-here
   NEXTAUTH_URL=http://localhost:3000
   ```

2. **Frontend** (`frontend/.env.local`):
   ```bash
   NEXTAUTH_SECRET=your-secret-here
   NEXTAUTH_URL=http://localhost:3001
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

### Testing

```bash
# Backend
cd backend
npm test

# Frontend  
cd frontend
npm test
```

## 📦 Despliegue

### Producción

1. Configurar variables de entorno de producción
2. Usar un servicio de PostgreSQL (AWS RDS, Railway, etc.)
3. Desplegar backend y frontend por separado

### Docker (Opcional)

```bash
# Todo el stack
docker-compose -f docker-compose.production.yml up -d
```

## 🤝 Contribución

1. Fork del proyecto
2. Crear feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📚 Documentación

- [`database/DATABASE_SETUP.md`](./database/DATABASE_SETUP.md) - Setup completo de base de datos
- [`AUTH_IMPLEMENTATION_SUMMARY.md`](./AUTH_IMPLEMENTATION_SUMMARY.md) - Implementación de autenticación
- [`KEYCLOAK_SETUP.md`](./KEYCLOAK_SETUP.md) - Configuración de Keycloak
- `/backend/public/openapi.yaml` - Documentación OpenAPI

## 🐛 Troubleshooting

### Base de datos no conecta
```bash
docker-compose ps  # Verificar que PostgreSQL esté corriendo
docker-compose logs postgres  # Ver logs de PostgreSQL
```

### Error de autenticación
- Verificar que `NEXTAUTH_SECRET` esté configurado
- Revisar URLs en variables de entorno

### Puerto ocupado
```bash
# Cambiar puertos en docker-compose.yml si es necesario
lsof -i :3000  # Ver qué proceso usa el puerto
```

## 📄 Licencia

[Agregar información de licencia aquí]
