# Imagen base - Prisma 7 requiere Node.js 20+
FROM node:20-alpine

# Directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del proyecto
COPY . .

# Crear archivo .env temporal con valores por defecto para el build
# Las variables reales se pasarán en runtime desde docker-compose
RUN echo "DATABASE_URL=postgresql://postgres:password@localhost:5432/stock_management" > .env && \
    echo "KEYCLOAK_ISSUER=http://localhost:8080/realms/ds-2025-realm" >> .env && \
    echo "KEYCLOAK_REALM=ds-2025-realm" >> .env && \
    echo "KEYCLOAK_CLIENT_ID=grupo-11" >> .env && \
    echo "KEYCLOAK_CLIENT_SECRET=placeholder" >> .env

# Construir Next.js
RUN npm run build

# Eliminar el .env temporal después del build
RUN rm -f .env

# Exponer puerto
EXPOSE 3000

# Crear script de inicio que ejecuta el seed solo si la BD está vacía
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'echo "🔍 Verificando si la base de datos tiene datos..."' >> /app/start.sh && \
    echo 'COUNT=$(node -e "const { PrismaClient } = require(\"@prisma/client\"); const { PrismaPg } = require(\"@prisma/adapter-pg\"); const { Pool } = require(\"pg\"); const pool = new Pool({ connectionString: process.env.DATABASE_URL }); const prisma = new PrismaClient({ adapter: new PrismaPg(pool) }); prisma.producto.count().then(c => { console.log(c); process.exit(0); }).catch(() => { console.log(0); process.exit(0); });" 2>/dev/null || echo 0)' >> /app/start.sh && \
    echo 'if [ "$COUNT" = "0" ]; then' >> /app/start.sh && \
    echo '  echo "🌱 Base de datos vacía, ejecutando seed..."' >> /app/start.sh && \
    echo '  npm run prisma:seed || echo "⚠️ Seed falló, continuando..."' >> /app/start.sh && \
    echo 'else' >> /app/start.sh && \
    echo '  echo "✅ Base de datos ya tiene datos ($COUNT productos), omitiendo seed"' >> /app/start.sh && \
    echo 'fi' >> /app/start.sh && \
    echo 'echo "🚀 Iniciando aplicación..."' >> /app/start.sh && \
    echo 'npm start' >> /app/start.sh && \
    chmod +x /app/start.sh

# Comando final - ejecuta el script de inicio
CMD ["/app/start.sh"]
