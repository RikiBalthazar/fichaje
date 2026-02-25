# 📚 Ejemplos de API

## Endpoints principales

### Health Check

```
GET /api/health

Response: 
{
  "status": "ok",
  "timestamp": "2024-02-24T10:30:00.000Z"
}
```

---

## Proyectos (Projects)

### Obtener todos los proyectos

```
GET /api/projects

Response:
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Desarrollo Frontend",
    "description": "Mejoras en interfaz",
    "totalMinutes": 480,
    "createdAt": "2024-02-20T09:15:00.000Z",
    "updatedAt": "2024-02-24T10:00:00.000Z"
  },
  {
    "id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    "name": "Testing",
    "description": "Suite de tests",
    "totalMinutes": 120,
    "createdAt": "2024-02-21T14:30:00.000Z",
    "updatedAt": "2024-02-24T10:00:00.000Z"
  }
]
```

### Obtener proyecto por ID

```
GET /api/projects/:id

URL: /api/projects/550e8400-e29b-41d4-a716-446655440000

Response:
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Desarrollo Frontend",
  "description": "Mejoras en interfaz",
  "totalMinutes": 480,
  "createdAt": "2024-02-20T09:15:00.000Z",
  "updatedAt": "2024-02-24T10:00:00.000Z"
}
```

### Crear proyecto

```
POST /api/projects

Body:
{
  "name": "Nuevo Proyecto",
  "description": "Descripción opcional"
}

Response (201 Created):
{
  "id": "7ba7b811-9dad-11d1-80b4-00c04fd430c9",
  "name": "Nuevo Proyecto",
  "description": "Descripción opcional",
  "totalMinutes": 0,
  "createdAt": "2024-02-24T10:30:00.000Z",
  "updatedAt": "2024-02-24T10:30:00.000Z"
}
```

### Actualizar proyecto

```
PUT /api/projects/:id

URL: /api/projects/550e8400-e29b-41d4-a716-446655440000

Body:
{
  "name": "Desarrollo Frontend - Actualizado",
  "description": "Nuevas mejoras"
}

Response (200 OK):
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Desarrollo Frontend - Actualizado",
  "description": "Nuevas mejoras",
  "totalMinutes": 480,
  "createdAt": "2024-02-20T09:15:00.000Z",
  "updatedAt": "2024-02-24T10:35:00.000Z"
}
```

### Eliminar proyecto

```
DELETE /api/projects/:id

URL: /api/projects/550e8400-e29b-41d4-a716-446655440000

Response (200 OK):
{
  "message": "Proyecto eliminado correctamente"
}

⚠️ NOTA: Elimina también todos los time entries asociados (CASCADE)
```

---

## Registros de tiempo (Time Entries)

### Obtener todos los registros

```
GET /api/time-entries

Response:
[
  {
    "id": "8ca7b812-9dad-11d1-80b4-00c04fd430ca",
    "projectId": "550e8400-e29b-41d4-a716-446655440000",
    "startTime": "2024-02-24T09:00:00.000Z",
    "endTime": "2024-02-24T10:30:00.000Z",
    "duration": 5400,
    "durationCentesimal": "1:50",
    "description": "Implementó componentes de formulario",
    "createdAt": "2024-02-24T10:32:00.000Z"
  },
  {
    "id": "9da7b813-9dad-11d1-80b4-00c04fd430cb",
    "projectId": "550e8400-e29b-41d4-a716-446655440000",
    "startTime": "2024-02-24T11:00:00.000Z",
    "endTime": "2024-02-24T11:45:00.000Z",
    "duration": 2700,
    "durationCentesimal": "0:75",
    "description": "Testing de componentes",
    "createdAt": "2024-02-24T11:48:00.000Z"
  }
]
```

### Obtener registros por proyecto

```
GET /api/time-entries/project/:projectId

URL: /api/time-entries/project/550e8400-e29b-41d4-a716-446655440000

Response:
[
  {
    "id": "8ca7b812-9dad-11d1-80b4-00c04fd430ca",
    "projectId": "550e8400-e29b-41d4-a716-446655440000",
    "startTime": "2024-02-24T09:00:00.000Z",
    "endTime": "2024-02-24T10:30:00.000Z",
    "duration": 5400,
    "durationCentesimal": "1:50",
    "description": "Implementó componentes",
    "createdAt": "2024-02-24T10:32:00.000Z"
  }
]
```

### Crear registro de tiempo

```
POST /api/time-entries

Body:
{
  "projectId": "550e8400-e29b-41d4-a716-446655440000",
  "startTime": "2024-02-24T14:00:00.000Z",
  "endTime": "2024-02-24T15:15:00.000Z",
  "duration": 4500,
  "durationCentesimal": "1:25",
  "description": "Revisión de código y merge"
}

Response (201 Created):
{
  "id": "aeb7b814-9dad-11d1-80b4-00c04fd430cc",
  "projectId": "550e8400-e29b-41d4-a716-446655440000",
  "startTime": "2024-02-24T14:00:00.000Z",
  "endTime": "2024-02-24T15:15:00.000Z",
  "duration": 4500,
  "durationCentesimal": "1:25",
  "description": "Revisión de código y merge",
  "createdAt": "2024-02-24T15:18:00.000Z"
}
```

### Actualizar registro de tiempo

```
PUT /api/time-entries/:id

URL: /api/time-entries/aeb7b814-9dad-11d1-80b4-00c04fd430cc

Body (actualiza solo los campos que quieras):
{
  "description": "Revisión exhaustiva de código",
  "duration": 4800,
  "durationCentesimal": "1:20"
}

Response (200 OK):
{
  "id": "aeb7b814-9dad-11d1-80b4-00c04fd430cc",
  "projectId": "550e8400-e29b-41d4-a716-446655440000",
  "startTime": "2024-02-24T14:00:00.000Z",
  "endTime": "2024-02-24T15:15:00.000Z",
  "duration": 4800,
  "durationCentesimal": "1:20",
  "description": "Revisión exhaustiva de código",
  "createdAt": "2024-02-24T15:18:00.000Z"
}
```

### Eliminar registro de tiempo

```
DELETE /api/time-entries/:id

URL: /api/time-entries/aeb7b814-9dad-11d1-80b4-00c04fd430cc

Response (200 OK):
{
  "message": "Registro eliminado correctamente"
}
```

---

## Exportación (Export)

### Exportar a TXT

```
GET /api/export/txt

Response (200 OK):
{
  "content": "═══════════════════════════════════════════════════════════\nREPORTE DE HORAS - 24 de febrero de 2024\n═══════════════════════════════════════════════════════════\n\n1. Proyecto: Desarrollo Frontend\n   Descripción: Implementó componentes de formulario\n   Horas: 1:50 (centesimal)\n   Fecha: 24 de febrero de 2024 10:32\n\n2. Proyecto: Desarrollo Frontend\n   Descripción: Testing de componentes\n   Horas: 0:75 (centesimal)\n   Fecha: 24 de febrero de 2024 11:48\n\n───────────────────────────────────────────────────────────\nTOTAL: 3:05 horas (centesimal)\n═══════════════════════════════════════════════════════════\n"
}
```

---

## Ejemplos con cURL

### Crear un proyecto

```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mi Proyecto",
    "description": "Descripción del proyecto"
  }'
```

### Crear un registro de tiempo

```bash
curl -X POST http://localhost:3000/api/time-entries \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "550e8400-e29b-41d4-a716-446655440000",
    "startTime": "2024-02-24T09:00:00.000Z",
    "endTime": "2024-02-24T10:30:00.000Z",
    "duration": 5400,
    "durationCentesimal": "1:50",
    "description": "Trabajo realizado"
  }'
```

### Obtener todos los proyectos

```bash
curl http://localhost:3000/api/projects
```

### Actualizar proyecto

```bash
curl -X PUT http://localhost:3000/api/projects/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nombre actualizado"
  }'
```

### Eliminar proyecto

```bash
curl -X DELETE http://localhost:3000/api/projects/550e8400-e29b-41d4-a716-446655440000
```

---

## Ejemplos con JavaScript/Fetch

### Crear proyecto

```javascript
const response = await fetch('http://localhost:3000/api/projects', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Mi Proyecto',
    description: 'Descripción'
  })
});

const project = await response.json();
console.log('Proyecto creado:', project);
```

### Crear registro de tiempo

```javascript
const response = await fetch('http://localhost:3000/api/time-entries', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    projectId: projectId,
    startTime: new Date(Date.now() - 90*60*1000).toISOString(),
    endTime: new Date().toISOString(),
    duration: 5400,
    durationCentesimal: '1:50',
    description: 'Trabajo de desarrollo'
  })
});

const entry = await response.json();
console.log('Registro guardado:', entry);
```

---

## Códigos de estado HTTP

| Código | Significado |
|--------|-----------|
| 200 | OK - Solicitud exitosa |
| 201 | Created - Recurso creado |
| 400 | Bad Request - Datos inválidos |
| 404 | Not Found - Recurso no encontrado |
| 500 | Server Error - Error interno |

---

## Notas importantes

- 🔄 Las fechas siempre están en formato ISO 8601 UTC
- 📊 `duration` siempre en segundos (convertir a minutos con `/ 60`)
- 🔢 `durationCentesimal` siempre en formato `"H:MM"`
- 🔗 `projectId` debe existir antes de crear time entries
- 🗑️ Eliminar proyecto elimina automáticamente sus registros
