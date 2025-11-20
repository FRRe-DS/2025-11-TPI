# Imagen base
FROM node:18-alpine

# Directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del proyecto
COPY . .

# Construir Next.js
RUN npm run build

# Exponer puerto
EXPOSE 3000

# Comando final
CMD ["npm", "start"]
