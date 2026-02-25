# 📐 Documentación Técnica

## Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│                      NAVEGADOR (http)                        │
│  React 18 + TypeScript + TailwindCSS + Vite                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                 axios /api
                     │
┌────────────────────▼────────────────────────────────────────┐
│            NODE.JS EXPRESS SERVER (localhost:3000)           │
│  - CORS middleware                                            │
│  - Routes: /api/projects, /api/time-entries, /api/export    │
│  - Controllers: Lógica de negocio                            │
│  - Error handling: Middleware robusto                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                  SQLite3
                     │
┌────────────────────▼────────────────────────────────────────┐
│              BASE DE DATOS (data.db)                          │
│  - Tabla: projects (id, name, description, total_minutes)   │
│  - Tabla: time_entries (id, projectId, duration, ...)       │
│  - Foreign keys: projectId → projects.id (ON DELETE CASCADE) │
│  - Índices para optimización                                 │
└─────────────────────────────────────────────────────────────┘
```

## Flujo de datos - Ejemplo: Iniciar cronómetro

```
1. Usuario click en botón "Iniciar" de proyecto
   │
   ├─→ ProjectCard.tsx: onPlay(projectId)
       │
       ├─→ App.tsx: handlePlayProject(projectId)
       │
       ├─→ useTimer hook: start(projectId)
       │   ├─→ setTimerState({ projectId, isRunning: true, ... })
       │   ├─→ localStorage.setItem('timerState', JSON.stringify(...))
       │   └─→ useEffect inicia setInterval cada segundo
       │
       └─→ Toast: "Cronómetro iniciado"
```

## Flujo de datos - Ejemplo: Detener y guardar

```
1. Usuario click en botón "Detener"
   │
   └─→ ProjectCard.tsx: onStop()
       │
       ├─→ App.tsx: handleStopProject()
       │
       ├─→ useTimer: stop()
       │   ├─→ Calcula duración total en segundos
       │   ├─→ Genera UUID para el registro
       │   └─→ Reset del estado local
       │
       ├─→ timeEntriesAPI.create({
       │   projectId, startTime, endTime, 
       │   duration, durationCentesimal, description
       │ })
       │
       ├─→ SERVER POST /api/time-entries
       │   ├─→ timeEntriesController.createTimeEntry()
       │   ├─→ INSERT INTO time_entries
       │   └─→ Response con entry creado
       │
       ├─→ loadProjects() // Actualizar totales
       │
       └─→ Toast: "Registrado: X:XX horas (centesimal)"
```

## Estructura de tipos

### Frontend (client/src/types/index.ts)

```typescript
interface Project {
  id: string;          // UUID generado en cliente o servidor
  name: string;
  description: string;
  createdAt: string;   // ISO 8601
  totalMinutes: number; // Calculado por el servidor
}

interface TimeEntry {
  id: string;                  // UUID
  projectId: string;           // FK → Project.id
  startTime: string;           // ISO 8601
  endTime: string | null;      // ISO 8601
  duration: number;            // Segundos
  durationCentesimal: string;  // "H:MM" formato
  description: string;         // Texto con voz
  createdAt: string;           // ISO 8601
}

interface TimerState {
  projectId: string | null;
  isRunning: boolean;
  elapsedSeconds: number;
  startedAt: number;  // timestamp
}
```

### Backend (server/src/types/index.ts)

```typescript
// Base de datos - snake_case
interface ProjectDB {
  id: TEXT PRIMARY KEY
  name: TEXT NOT NULL
  description: TEXT
  total_minutes: INTEGER
  created_at: TEXT
  updated_at: TEXT
}

interface TimeEntryDB {
  id: TEXT PRIMARY KEY
  project_id: TEXT FK
  start_time: TEXT
  end_time: TEXT
  duration: INTEGER (segundos)
  duration_centesimal: TEXT
  description: TEXT
  created_at: TEXT
}
```

## Conversión centesimal

### Algoritmo

```
Entrada: minutos totales (ej: 90)
Proceso:
  1. horas = floor(minutos / 60)           → 90 / 60 = 1
  2. minutosRestantes = minutos % 60       → 90 % 60 = 30
  3. centesimal = round((minutosRestantes / 60) * 100)
                = round((30 / 60) * 100)   → 50
  4. Retorna: `${horas}:${padStart(centesimal, 2)}`
             → "1:50"
```

### Ejemplos

| Minutos | Cálculo | Centesimal |
|---------|---------|-----------|
| 0       | 0 / 60  | 0:00      |
| 1       | 1 / 60  | 0:02      |
| 15      | 15 / 60 | 0:25      |
| 30      | 30 / 60 | 0:50      |
| 45      | 45 / 60 | 0:75      |
| 60      | 60 / 60 | 1:00      |
| 90      | 90 / 60 | 1:50      |
| 120     | 120 / 60| 2:00      |

## Gestión del estado

### Cliente - React Hooks

```typescript
// App.tsx estado global
const [projects, setProjects] = useState<Project[]>([]);
const [entries, setEntries] = useState<TimeEntry[]>([]);
const { timerState, start, pause, stop } = useTimer();

// Sincronización: localStorage + API
useEffect(() => {
  // Restaurar timer de localStorage
  const saved = localStorage.getItem('timerState');
  if (saved) {
    const state = JSON.parse(saved);
    setTimerState(state);
  }
}, []);

// Guardar cambios
useEffect(() => {
  localStorage.setItem('timerState', JSON.stringify(timerState));
}, [timerState]);
```

### Servidor - SQLite

```sql
-- Integridad referencial
PRAGMA foreign_keys = ON;

-- Cascada de eliminación: si elimino un proyecto, se eliminan sus registros
CREATE TABLE time_entries (
  ...
  project_id TEXT NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Índices para velocidad
CREATE INDEX idx_time_entries_project_id ON time_entries(project_id);
CREATE INDEX idx_time_entries_created_at ON time_entries(created_at);
```

## Manejo de errores

### Frontend

```typescript
try {
  const data = await projectsAPI.getAll();
  setProjects(data);
} catch (error) {
  console.error('Error:', error);
  showToast('Error al cargar proyectos', 'error'); // Feedback visual
}
```

### Backend

```typescript
// Middleware de error centralizado
app.use(errorHandler);

// En controllers
try {
  // lógica
} catch (error) {
  console.error('Error:', error);
  res.status(500).json({ error: 'Mensaje amigable' });
}
```

## Performance

### Optimizaciones implementadas

1. **Índices en BD**: Las columnas `project_id` y `created_at` tienen índices
2. **Lazy loading**: Proyectos se cargan bajo demanda
3. **Cleanup timers**: useEffect limpia intervalos
4. **Memozación**: Funciones puras sin efectos secundarios
5. **Gzip compression**: Express comprime respuestas en producción

### Escalabilidad

Para escalar a producción:

1. **Base de datos**: Migra a PostgreSQL o MySQL
2. **Caché**: Implementa Redis para sesiones
3. **CDN**: Sirve assets estáticos desde CDN
4. **Autenticación**: Añade JWT y validación
5. **Logging**: Integra Winston o Pino
6. **Monitoreo**: Sentry o New Relic

## Testing

### Tests unitarios

```bash
# Cliente
cd client && npx ts-node src/utils/time.test.ts

# Servidor
cd server && npm run test
```

### Tests de integración (manual)

```bash
# 1. Arrancar servidor
npm run dev

# 2. Crear proyecto con curl
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Project"}'

# 3. Crear entry
curl -X POST http://localhost:3000/api/time-entries \
  -H "Content-Type: application/json" \
  -d '{
    "projectId":"...",
    "startTime":"2024-01-01T10:00:00Z",
    "endTime":"2024-01-01T11:30:00Z",
    "duration":5400,
    "durationCentesimal":"1:50"
  }'
```

## Seguridad

### Implementado

- ✅ TypeScript para type safety
- ✅ Validación de inputs en servidor
- ✅ CORS configurado
- ✅ Prepared statements (sqlite3 library)

### Recomendado para producción

- ⚠️ Autenticación (JWT)
- ⚠️ Rate limiting
- ⚠️ HTTPS obligatorio
- ⚠️ Sanitización de inputs
- ⚠️ CSRF protection
- ⚠️ Helmet.js para headers seguras

## Debugging

### Frontend

```typescript
// Chrome DevTools → Network
// Ver todas las llamadas API y respuestas

// Console
console.log('Estado:', { timerState, projects });
localStorage.getItem('timerState'); // Ver estado persistido
```

### Servidor

```bash
# Terminal
# Logs automáticos en:
# - Inicialización BD
# - Errores de rutas
# - Consultas SQL

# Más debugging
DEBUG=* npm run dev
```

### Base de datos

```bash
# Ver esquema
.schema

# Ver datos
SELECT * FROM projects;
SELECT * FROM time_entries WHERE project_id = '...';

# Usar herramienta como SQLiteBrowser para interfaz gráfica
```
