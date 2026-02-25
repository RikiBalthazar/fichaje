# ⏱️ Control de Partes - Sistema de Fichaje de Horas

Sistema moderno y completo de control de partes de horas basado en **React + TypeScript + Node.js + SQLite**. Una aplicación web lista para producción con interfaz intuitiva, cronómetro robusto y conversión centesimal de horas.

## ✨ Características principales

- 📊 **Dashboard interactivo** con grid responsive de proyectos
- ⏱️ **Cronómetro robusto** con un solo timer activo a la vez
- 🎤 **Descripción por voz** usando Web Speech API con transcripción en tiempo real
- 🔢 **Conversión centesimal** de horas (0-100 minutos, no 0-60)
- 💾 **Persistencia robusta** en SQLite con relaciones correctas
- 📋 **Gestión completa** de proyectos (crear, editar, eliminar)
- 🛠️ **Vista de administración** para editar registros de tiempo
- 📥 **Exportación a TXT** con formato UTF-8, ordenado por fecha
- 🎨 **UI moderna** tipo SaaS con TailwindCSS
- 🔔 **Toast notifications** para feedback al usuario
- 📱 **Responsive design** para móvil, tablet y desktop

## 🛠️ Stack Tecnológico

### Frontend
- **React 18** con TypeScript
- **Vite** como bundler
- **TailwindCSS** para estilos
- **Axios** para comunicación API
- **Web Speech API** para reconocimiento de voz

### Backend
- **Node.js** con TypeScript
- **Express.js** como framework web
- **SQLite3** como base de datos
- **CORS** habilitado para desarrollo local

## 📦 Requisitos previos

- **Node.js** 16+ instalado
- **npm** o **yarn**
- Navegador moderno (Chrome, Edge, Firefox) para Speech-to-text

## 🚀 Instalación y arranque

### 1. Clonar/Descargar el proyecto

```bash
cd c:\Users\ricar\Desktop\Sistema\ fichaje
```

### 2. Instalar dependencias del servidor

```bash
cd server
npm install
```

### 3. Instalar dependencias del cliente

```bash
cd ../client
npm install
```

### 4. Arrancar el servidor (en una terminal)

```bash
cd ../server
npm run dev
```

Debería ver algo como:
```
✅ Database initialized
✅ Servidor ejecutándose en http://localhost:3000
📚 API base: http://localhost:3000/api
```

### 5. Arrancar el cliente (en otra terminal)

```bash
cd ../client
npm run dev
```

El cliente estará disponible en `http://localhost:5173`

## 🎯 Guía de uso

### Crear un proyecto

1. Click en el botón **"➕ Nuevo Proyecto"**
2. Ingresa el nombre y descripción (opcional)
3. Click en **"Crear"**

### Iniciar un cronómetro

1. Click en el botón **"▶ Iniciar"** en la tarjeta del proyecto
2. El cronómetro comenzará a contar
3. La tarjeta cambiará de color a azul para indicar que está activa

### Agregar descripción por voz

1. Con el cronómetro activo, click en el botón **"🎤 Descripción"**
2. Se abrirá un modal
3. Click en **"Grabar voz"**
4. Habla cerca del micrófono (se requieren permisos)
5. La voz se transcribirá en tiempo real en el textarea
6. Click en **"Guardar descripción"** para finalizar

### Pausar/Detener el cronómetro

- **⏸️ Pausa**: Pausa el cronómetro sin guardar
- **⏹️ Detener**: Finaliza la sesión y guarda el tiempo
- **Editar**: Modifica el nombre/descripción del proyecto
- **Eliminar**: Elimina el proyecto (con confirmación)

### Ver y editar registros

1. Click en el botón **"📋 Administración"**
2. Verás una tabla con todos los registros
3. Puedes editar duración, descripción o eliminar registros
4. Los cambios se guardan inmediatamente

### Exportar datos

1. Click en el botón **"📥 Exportar TXT"**
2. Se descargará un archivo con todos los registros
3. Formato: UTF-8, ordenado por fecha, con totales en centesimal

## 🔢 Formato centesimal

Este sistema utiliza horas centesimales donde los minutos van de 0 a 100:

| Tiempo real | Centesimal |
|------------|-----------|
| 1h 30m    | 1:50      |
| 15m       | 0:25      |
| 45m       | 0:75      |
| 1h        | 1:00      |
| 30m       | 0:50      |

**Fórmula**: `horas:((minutos/60)*100)`

## 📚 Estructura del proyecto

```
Sistema fichaje/
├── client/                  # Frontend React
│   ├── src/
│   │   ├── components/      # Componentes React reutilizables
│   │   ├── hooks/           # Custom hooks (useTimer, useSpeechRecognition)
│   │   ├── services/        # Llamadas API
│   │   ├── types/           # Tipos TypeScript
│   │   ├── utils/           # Funciones de utilidad
│   │   ├── App.tsx          # Componente principal
│   │   └── main.tsx         # Entrada de React
│   ├── public/              # Assets estáticos
│   └── package.json
├── server/                  # Backend Node.js
│   ├── src/
│   │   ├── controllers/     # Lógica de negocio
│   │   ├── routes/          # Rutas de API
│   │   ├── middleware/      # Middleware (error handling)
│   │   ├── database/        # Configuración SQLite
│   │   ├── types/           # Tipos TypeScript
│   │   ├── utils/           # Funciones de utilidad
│   │   └── index.ts         # Punto de entrada
│   ├── data.db              # Base de datos SQLite (se crea automáticamente)
│   └── package.json
└── README.md

```

## 🔌 API Endpoints

### Proyectos

```
GET    /api/projects              # Obtener todos
POST   /api/projects              # Crear nuevo
GET    /api/projects/:id          # Obtener por ID
PUT    /api/projects/:id          # Actualizar
DELETE /api/projects/:id          # Eliminar
```

### Registros de tiempo

```
GET    /api/time-entries          # Obtener todos
GET    /api/time-entries/project/:projectId
POST   /api/time-entries          # Crear nuevo
PUT    /api/time-entries/:id      # Actualizar
DELETE /api/time-entries/:id      # Eliminar
```

### Exportación

```
GET    /api/export/txt            # Exportar como TXT
```

## 🧪 Tests

### Ejecutar tests de conversión centesimal

```bash
cd client
npx ts-node src/utils/time.test.ts
```

Debería mostrar algo como:
```
✓ Test 1 passed: 90 min → 1:50
✓ Test 2 passed: 15 min → 0:25
✓ Test 3 passed: 45 min → 0:75
...
✨ All centesimal conversion tests completed!
```

## 🐛 Solución de problemas

### "Speech Recognition no soportada"
- Asegúrate de usar un navegador moderno (Chrome, Edge, Firefox)
- Algunos navegadores requieren HTTPS en producción
- Verifica que hayas dado permisos del micrófono

### "Error de conexión con el servidor"
- Verifica que el servidor está corriendo en `http://localhost:3000`
- Comprueba que el firewall permite la conexión
- Revisa la terminal del servidor para errores

### "Base de datos vacía"
- El archivo `data.db` se crea automáticamente en la primera ejecución
- Si hay problemas, elimina `data.db` y reinicia el servidor

### Timer se detiene al recargar
- Los cambios del documento usan localStorage para persistencia
- Si usas incógnito, los datos se pierden al cerrar

## 📦 Build para producción

### Compilar el cliente

```bash
cd client
npm run build
```

Genera los archivos optimizados en `client/dist/`

### Compilar el servidor

```bash
cd server
npm run build
```

Genera los archivos compilados en `server/dist/`

## 🎓 Buenas prácticas implementadas

- ✅ **TypeScript** para type safety
- ✅ **React Hooks** en lugar de clases
- ✅ **Custom Hooks** para lógica reutilizable
- ✅ **Manejo de errores** completo
- ✅ **Validación de datos** en cliente y servidor
- ✅ **Foreign Keys** en SQLite para integridad referencial
- ✅ **Índices** en base de datos para optimización
- ✅ **Cleanup** de timers para evitar memory leaks
- ✅ **localStorage** para persistencia del estado
- ✅ **Formateo de códigos** coherente

## 📝 Licencia

MIT

## 💬 Soporte

Para reportar problemas o sugerencias, crea un issue en el repositorio.

---

🚀 **¡Listo para usar!** Disfruta de tu sistema de control de partes.
