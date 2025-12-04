#!/bin/bash
# Script para reconstruir el backend con los cambios de Prisma

echo "🔨 Reconstruyendo contenedor backend..."
docker compose build backend

echo "🚀 Iniciando contenedor..."
docker compose up -d backend

echo "⏳ Esperando 5 segundos..."
sleep 5

echo "📋 Logs del contenedor:"
docker logs backend --tail 30

echo ""
echo "✅ Backend reconstruido y corriendo en http://localhost:3000"
echo "💡 Para ver logs en tiempo real: docker logs -f backend"
