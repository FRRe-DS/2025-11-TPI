# Database Setup

Esta carpeta contiene toda la configuración y documentación necesaria para la base de datos PostgreSQL del proyecto.

## 📁 Contenido

- **`docker-compose.yml`** - Configuración de Docker Compose para PostgreSQL y Adminer
- **`schema.sql`** - Schema completo de la base de datos con datos de ejemplo
- **`init.sh`** - Script de inicialización de la base de datos
- **`DATABASE_SETUP.md`** - Documentación completa del setup

## 🚀 Quick Start

1. **Levantar la base de datos:**
   ```bash
   cd database
   docker-compose up -d
   ```

2. **Verificar que esté funcionando:**
   ```bash
   docker-compose ps
   ```

3. **Acceder a Adminer (interfaz web):**
   - URL: http://localhost:8080
   - Sistema: PostgreSQL
   - Servidor: postgres
   - Usuario: postgres
   - Contraseña: password
   - Base de datos: stock_management

## 🗄️ Base de Datos

- **Puerto:** 5432
- **Base de datos:** stock_management
- **Usuario:** postgres
- **Contraseña:** password

## 📊 Tablas Incluidas

El schema incluye:
- `productos` - Información de productos con JSONB para datos complejos
- `categorias` - Categorías de productos
- `producto_categorias` - Relación many-to-many productos-categorías
- `reservas` - Órdenes/reservas
- `reserva_productos` - Productos en cada reserva

## 🔧 Configuración del Backend

El backend debe configurarse con estas variables de entorno (ver `backend/.env.example`):

```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=stock_management
DB_USER=postgres
DB_PASSWORD=password
```

## 📚 Documentación Completa

Ver [`DATABASE_SETUP.md`](./DATABASE_SETUP.md) para instrucciones detalladas, troubleshooting y configuración avanzada.

## 🧹 Limpiar

Para limpiar la base de datos y empezar de cero:

```bash
docker-compose down -v
docker-compose up -d
```

El flag `-v` elimina los volúmenes (datos persistentes).
