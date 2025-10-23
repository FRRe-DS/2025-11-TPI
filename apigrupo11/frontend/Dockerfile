# Usa la última versión estable de Node
FROM node:22-alpine

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos de dependencias primero (para aprovechar la caché)
COPY package*.json ./

# Instala dependencias
RUN npm install --legacy-peer-deps

# Copia el resto del código del proyecto
COPY . .

# Expone el puerto por donde Vite sirve la app
EXPOSE 5173

# Comando por defecto al iniciar el contenedor
CMD ["npm", "run", "dev"]
