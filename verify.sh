#!/bin/bash
# Script para verificar la instalación (compatible con bash/sh)

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║      Verificador de instalación - Sistema de Fichaje       ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Función para comprobar si un comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Comprobaciones
echo "🔍 Verificando requisitos..."
echo ""

if command_exists node; then
    NODE_V=$(node --version)
    echo "✅ Node.js: $NODE_V"
else
    echo "❌ Node.js no encontrado"
    exit 1
fi

if command_exists npm; then
    NPM_V=$(npm --version)
    echo "✅ npm: $NPM_V"
else
    echo "❌ npm no encontrado"
    exit 1
fi

echo ""
echo "📂 Verificando estructura..."
echo ""

if [ -d "server" ]; then
    echo "✅ Carpeta /server encontrada"
else
    echo "❌ Carpeta /server NO encontrada"
fi

if [ -d "client" ]; then
    echo "✅ Carpeta /client encontrada"
else
    echo "❌ Carpeta /client NO encontrada"
fi

if [ -f "README.md" ]; then
    echo "✅ README.md encontrado"
else
    echo "❌ README.md NO encontrado"
fi

echo ""
echo "📦 Verificando paquetes..."
echo ""

if [ -d "server/node_modules" ]; then
    echo "✅ Paquetes del servidor instalados"
else
    echo "⚠️  Dependencias del servidor NO instaladas (ejecutar: cd server && npm install)"
fi

if [ -d "client/node_modules" ]; then
    echo "✅ Paquetes del cliente instalados"
else
    echo "⚠️  Dependencias del cliente NO instaladas (ejecutar: cd client && npm install)"
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo ""
echo "✨ Próximos pasos:"
echo ""
echo "1. Si algún paquete no está instalado, ejecuta:"
echo "   ./install.bat  (En Windows)"
echo ""
echo "2. Arrancar el servidor:"
echo "   cd server && npm run dev"
echo ""
echo "3. En otra terminal, arrancar el cliente:"
echo "   cd client && npm run dev"
echo ""
echo "4. Abre tu navegador en: http://localhost:5173"
echo ""
echo "════════════════════════════════════════════════════════════"
echo ""
