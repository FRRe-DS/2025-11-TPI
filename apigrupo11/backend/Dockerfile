# Build de la aplicación
FROM node:22-alpine AS builder
WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar el código fuente
COPY . .

# Si tu backend necesita build (TypeScript → dist):
# RUN npm run build

# Imagen final
FROM node:22-alpine
WORKDIR /app

COPY --from=builder /app ./

# Variables de entorno
ENV NODE_ENV=production

EXPOSE 4000

CMD ["npm", "start"]
