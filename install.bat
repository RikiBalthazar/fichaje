@echo off
REM Script para instalar dependencias en ambas carpetas

echo.
echo ====================================
echo Instalando dependencias del servidor
echo ====================================
echo.

cd server
call npm install

if errorlevel 1 (
    echo Error al instalar dependencias del servidor
    exit /b 1
)

echo.
echo ====================================
echo Instalando dependencias del cliente
echo ====================================
echo.

cd ../client
call npm install

if errorlevel 1 (
    echo Error al instalar dependencias del cliente
    exit /b 1
)

echo.
echo ====================================
echo ✅ Instalación completada
echo ====================================
echo.
echo Para arrancar la aplicación:
echo 1. En una terminal: cd server && npm run dev
echo 2. En otra terminal: cd client && npm run dev
echo.
pause
