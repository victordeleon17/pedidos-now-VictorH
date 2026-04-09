# Dockerfile para Módulo de Logística
FROM node:18-alpine

# Crear directorio de trabajo
WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias
RUN npm install --omit=dev

# Copiar código fuente
COPY . .

# Exponer puerto
EXPOSE 3005

# Script de inicio
CMD ["node", "server.js"]
