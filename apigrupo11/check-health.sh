#!/bin/bash

echo "🔍 Verificando el estado del monorepo..."
echo ""

# Verificar si los servidores están corriendo
echo "📡 Verificando servidores:"
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "✅ Backend corriendo en puerto 3000"
else
    echo "❌ Backend NO está corriendo"
fi

if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "✅ Frontend corriendo en puerto 5173"
else
    echo "❌ Frontend NO está corriendo"
fi

echo ""
echo "📁 Verificando estructura de archivos:"

# Verificar archivos críticos
if [ -f "frontend/src/lib/api-client.ts" ]; then
    echo "✅ API Client configurado"
else
    echo "❌ Falta api-client.ts"
fi

if [ -f "frontend/vite.config.ts" ]; then
    echo "✅ Vite config existe"
else
    echo "❌ Falta vite.config.ts"
fi

if [ -f "backend/src/lib/db.ts" ]; then
    echo "✅ Backend DB configurado"
else
    echo "❌ Falta db.ts"
fi

echo ""
echo "🔧 Verificando archivos problemáticos (no deberían existir):"

PROBLEMATIC_FILES=(
    "frontend/src/lib/DEMO_conexion.ts"
    "backend/NEXT_VS_EXPRESS.ts"
    "backend/EJEMPLO_EXPRESS_HIBRIDO.js"
)

FOUND_PROBLEMATIC=false
for file in "${PROBLEMATIC_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "⚠️  Encontrado: $file (debería eliminarse)"
        FOUND_PROBLEMATIC=true
    fi
done

if [ "$FOUND_PROBLEMATIC" = false ]; then
    echo "✅ No hay archivos problemáticos"
fi

echo ""
echo "🔎 Buscando archivos .ts con hooks (pueden causar problemas):"
if grep -r "useState\|useEffect" frontend/src --include="*.ts" 2>/dev/null; then
    echo "⚠️  Archivos .ts con hooks encontrados (deberían ser .tsx)"
else
    echo "✅ No hay archivos .ts con hooks"
fi

echo ""
echo "📊 Resumen:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Backend:  http://localhost:3000"
echo "Frontend: http://localhost:5173"
echo "API Docs: http://localhost:3000/openapi.yaml"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
