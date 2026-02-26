# 📋 Roadmap de Desarrollo - Sistema de Control de Partes

## 📅 Última actualización: 26 de Febrero de 2026

---

## ✅ SPRINTS PLANIFICADOS

### 🚀 **SPRINT 1: PRODUCTIVIDAD INMEDIATA** (Semana 1-2)
**Objetivo:** Reducir tiempo de interacción y mejorar velocidad de uso

#### 1️⃣ **Atajos de Teclado** - PRIORIDAD 🔴 CRÍTICA
**Descripción:** Sistema de atajos de teclado para maximizar velocidad
- [ ] Alt + 1-9: Iniciar proyecto rápido (proyectos numerados por orden de aparición)
- [ ] Espacio: Play/Pause del proyecto activo
- [ ] Alt + V: Grabar descripción sin abrir modal
  - [ ] Toast notification en esquina inferior derecha
  - [ ] Confirmar grabación correcta con icono ✓
  - [ ] Auto-guardado en BD
- [ ] Esc: Detener timer activo
- [ ] Mostrar ayuda de atajos: ? o Help

**Notas técnicas:**
- Usar evento `keydown` en document
- Evitar conflictos con atajos del navegador
- Deshabilitar atajos si hay modal abierto
- Toast component reutilizable

**Dependencias:** Ninguna

---

#### 2️⃣ **Proyectos Favoritos/Recientes** - PRIORIDAD 🟡 ALTA
**Descripción:** Ordenar proyectos por favoritos y acceso rápido
- [ ] Icono de pin (⭐) en cada tarjeta para marcar favoritos
- [ ] Actualizarse en tiempo real en el cliente
- [ ] Guardar estado de favoritos en BD (columna `is_favorite` en projects)
- [ ] Ordenar por: Favoritos → Recientes → Resto
- [ ] Badge con horas trabajadas hoy
- [ ] Indicador de "activo hoy" (diferente color si usaron hoy)

**Notas técnicas:**
- Agregar columna `is_favorite BOOLEAN DEFAULT 0` a tabla projects
- Crear endpoint PATCH /api/projects/:id/favorite
- Agregar timestamp `last_used_at` para "recientes"
- Ordenar en el hook useProjects

**Dependencias:** Base de datos

---

#### 3️⃣ **Búsqueda y Filtros Rápidos** - PRIORIDAD 🟡 ALTA
**Descripción:** Encontrar proyectos rápidamente
- [ ] Barra de búsqueda en header (como Ctrl + K)
- [ ] Búsqueda por nombre/descripción
- [ ] Filtrar por tags (ver punto 4)
- [ ] Limpiar búsqueda con X
- [ ] Mostrar "0 resultados" si no hay coincidencias
- [ ] Debounce de 300ms en búsqueda

**Notas técnicas:**
- Crear componente SearchBar reutilizable
- Filtrar en el hook useProjects
- Usar useMemo para evitar recálculos
- Debounce con useCallback

**Dependencias:** Ninguna (se puede hacer local en cliente)

---

#### 4️⃣ **Tags en Proyectos** - PRIORIDAD 🟡 ALTA
**Descripción:** Clasificar proyectos con etiquetas
- [ ] Campo de tags en formulario de nuevo proyecto (input con pills)
- [ ] Guardar tags comma-separated o JSON en BD
- [ ] Mostrar tags coloreados en tarjeta del proyecto
- [ ] Filtrar proyectos por tags
- [ ] Sugerencias de tags existentes al escribir
- [ ] Predefinidos: Backend, Frontend, Reunión, Admin, QA, Diseño, Marketing, Soporte

**Notas técnicas:**
- Agregar columna `tags TEXT` en tabla projects
- Guardar como JSON string "['Backend', 'Frontend']"
- Crear componente TagInput reutilizable
- API: PATCH /api/projects/:id/tags

**Dependencias:** Base de datos

---

### 📊 **SPRINT 2: ANALÍTICA Y ALERTAS** (Semana 3-4)
**Objetivo:** Visualizar datos y alertar sobre límites de tiempo

#### 5️⃣ **Notificaciones y Alertas** - PRIORIDAD 🔴 CRÍTICA
**Descripción:** Alertar cuando se supera límite de horas
- [ ] Push notification cuando pases de 8:30 horas en un día
  - [ ] Solicitar permiso al usuario
  - [ ] Toast visual en app
  - [ ] Mensaje: "⚠️ Has trabajado más de 8:30 horas hoy. Considera tomar un descanso"
- [ ] Verificación cada hora en reloj activo
- [ ] Recordatorio al finalizar día (opcional)
- [ ] No repetir notificación si ya se mostró en el día

**Notas técnicas:**
- Usar Web Notifications API
- Guardar timestamp de última notificación (localStorage)
- Calcular total horas diarias en App.tsx
- Service Worker para persist

**Dependencias:** Ninguna

---

#### 6️⃣ **Dashboard Mejorado** - PRIORIDAD 🟡 ALTA
**Descripción:** Gráficos y análisis de datos
- [ ] Gráfico de barras: Horas por proyecto (últimos 7/30 días)
  - [ ] Selector: últimos 7 días / últimos 30 días / este mes
  - [ ] Ordenar por mayor uso
- [ ] Gráfico de línea: Tendencia semanal de horas
  - [ ] Mostrar evolución de lunes a domingo
  - [ ] Línea de promedio
- [ ] Comparativa: Esta semana vs semana anterior
  - [ ] Porcentaje de cambio: +5%, -10%, etc.
- [ ] Distribución por día de la semana
  - [ ] Cards: Lunes 8h, Martes 6h, etc.
  - [ ] Identificar día más productivo
- [ ] Proyectos "muertos" (sin actividad en 30 días)
  - [ ] Lista desplegable
  - [ ] Opción de archivar

**Notas técnicas:**
- Usar librería Chart.js o Recharts
- Crear hook useDashboardData()
- Calcular totales en servidor (POST /api/dashboard/stats)
- Memoizar cálculos pesados
- Caché en localStorage con TTL de 1 hora

**Dependencias:** npm install chart.js recharts

---

#### 7️⃣ **Objetivos y Metas por Proyecto** - PRIORIDAD 🟡 MEDIA
**Descripción:** Establecer límites de horas por proyecto
- [ ] Campo opcional al crear/editar proyecto: "Horas objetivo"
- [ ] Barra de progreso en tarjeta del proyecto
  - [ ] Verde: 0-80% del objetivo
  - [ ] Amarillo: 80-100%
  - [ ] Rojo: > 100% (superado)
- [ ] Alerta cuando llegues al 80% del objetivo
- [ ] Modal de edición: cambiar objetivo
- [ ] Mostrar: "5h / 40h objetivo" (5 horas de 40)
- [ ] En Dashboard: proyectos en riesgo (superarán estimado esta semana)

**Notas técnicas:**
- Agregar columna `target_hours FLOAT DEFAULT NULL` en projects
- Actualizar GET /api/projects para incluir progreso
- Endpoint PATCH /api/projects/:id/target
- Hook useProjectProgress()

**Dependencias:** Base de datos

---

### 🎯 **SPRINT 3: EXPERIENCIA MÓVIL** (Semana 5-6)
**Objetivo:** App funcional en móviles y PWA instalable

#### 8️⃣ **Multi-dispositivo Mejorado** - PRIORIDAD 🔴 CRÍTICA
**Descripción:** PWA instalable y notificaciones cross-device
- [ ] PWA instalable
  - [ ] Manifest.json actualizado
  - [ ] Service Worker v2 con caché inteligente
  - [ ] Icono de app 192x192, 512x512
  - [ ] Splash screen personalizado
  - [ ] Opción de instalar en home screen
- [ ] Widget de inicio rápido en móvil
  - [ ] Botones de 1-9 visibles siempre
  - [ ] Timer en grande en home screen
- [ ] Notificaciones push cross-device
  - [ ] Si inicias en móvil, avisa al desktop
  - [ ] Si cambias dispositivo, pausa el anterior
- [ ] Orientación responsive
  - [ ] Landscape: grid 4 columnas
  - [ ] Portrait: 1-2 columnas

**Notas técnicas:**
- Actualizar public/manifest.json
- Mejorar service-worker.js
- Usar Notification API con sincronización
- Detectar cambio de dispositivo por localStorage + servidor

**Dependencias:** Service Worker

---

### ⚡ **SPRINT 4: OPTIMIZACIÓN** (Semana 7-8)
**Objetivo:** Rendimiento y seguridad

#### 9️⃣ **Optimizaciones de Rendimiento** - PRIORIDAD 🟡 MEDIA
**Descripción:** Hacer app más rápida y fluida
- [ ] Lazy load de proyectos
  - [ ] Cargar solo proyectos visibles + buffer
  - [ ] Cargar más al scroll
- [ ] Virtual scrolling para 100+ proyectos
  - [ ] Usar react-window o similar
- [ ] Debounce en búsqueda (300ms) y filtros
- [ ] Memoización de componentes
  - [ ] React.memo en ProjectCard
  - [ ] useMemo en cálculos
- [ ] IndexedDB para caché local
  - [ ] Guardar lista de proyectos
  - [ ] TTL: 5 minutos
  - [ ] Sincronizar en background
- [ ] Code splitting de modales
  - [ ] Lazy load de AdminView, DashboardModal, etc.
- [ ] Compresión de imágenes

**Notas técnicas:**
- npm install react-window, idb
- Profiling con DevTools
- Bundle size < 300KB gzipped
- Lighthouse score > 90

**Dependencias:** npm packages

---

#### 🔟 **Backup y Seguridad** - PRIORIDAD 🟡 ALTA
**Descripción:** Proteger datos del usuario
- [ ] Backup automático semanal
  - [ ] Cada viernes a las 22:00
  - [ ] Guardar en servidor (`backups/` folder)
  - [ ] Mantener últimos 4 backups
- [ ] Exportación completa de datos (JSON)
  - [ ] Botón "Descargar mis datos" en Cuenta
  - [ ] Incluye: Proyectos, entries, templates, configuración
  - [ ] Formato legible y documentado
- [ ] Importar datos desde backup
  - [ ] Modal con drag-drop
  - [ ] Validar estructura JSON
  - [ ] Opción: reemplazar vs. merge
- [ ] 2FA opcional
  - [ ] Email + código temporal
  - [ ] TOTP con Google Authenticator (futuro)
- [ ] Logs de auditoría básicos
  - [ ] Tabla: user_id, action, timestamp, details
  - [ ] Acciones: login, logout, create_project, start_timer, etc.
  - [ ] Ver última actividad en Cuenta

**Notas técnicas:**
- Tabla `audit_logs` en BD
- Endpoint POST /api/export para descargar JSON
- Endpoint POST /api/import para cargar datos
- Cron job para backups automáticos
- Hash dos factores con librerías de 2FA

**Dependencias:** npm install speakeasy qrcode

---

---

## 📈 ESTADO ACTUAL

| Feature | Estado | % Completo | Sprint |
|---------|--------|-----------|--------|
| Atajos de Teclado | 🔴 TODO | 0% | 1 |
| Proyectos Favoritos/Recientes | 🔴 TODO | 0% | 1 |
| Búsqueda y Filtros | 🔴 TODO | 0% | 1 |
| Tags en Proyectos | 🔴 TODO | 0% | 1 |
| Notificaciones de Límite 8:30h | 🔴 TODO | 0% | 2 |
| Dashboard Mejorado | 🔴 TODO | 0% | 2 |
| Objetivos y Metas | 🔴 TODO | 0% | 2 |
| PWA y Multi-dispositivo | 🔴 TODO | 0% | 3 |
| Optimizaciones de Rendimiento | 🔴 TODO | 0% | 4 |
| Backup y Seguridad | 🔴 TODO | 0% | 4 |

**Leyenda:** 🔴 TODO | 🟡 IN PROGRESS | 🟢 DONE

---

## 📋 CHECKPOINTS DE REVISIÓN

### Fin de Sprint 1
- [ ] Todos los atajos funcionan sin conflictos
- [ ] Búsqueda tiene < 100ms de lag
- [ ] Favoritos se sincronizan entre dispositivos
- [ ] Tests de atajos de teclado

### Fin de Sprint 2
- [ ] Notificación aparece correctamente
- [ ] Dashboard carga en < 2 segundos
- [ ] Gráficos son responsivos
- [ ] Metas se calculan correctamente

### Fin de Sprint 3
- [ ] PWA instalable en iOS y Android
- [ ] Funciona offline
- [ ] Sincronización cross-device funciona
- [ ] Home screen widget visible

### Fin de Sprint 4
- [ ] Lighthouse score ≥ 90
- [ ] App carga en < 1s en móvil 4G
- [ ] Imports/Exports funcionan
- [ ] 2FA opcional implementado

---

## 🔗 DEPENDENCIAS EXTERNAS

- **Charts:** Recharts o Chart.js
- **Virtual Scrolling:** react-window
- **IndexedDB:** idb
- **2FA:** speakeasy + qrcode
- **Notificaciones:** Web Notifications API nativa

---

## 📝 NOTAS GENERALES

- Mantener compatibilidad con navegadores: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- Probar en estos dispositivos: iPhone 12, Samsung Galaxy A32, iPad, Desktop (Windows/Mac)
- Todos los cambios en BD deben tener migrations reversibles
- Hacer commits pequeños y descriptivos
- Una feature = una rama de git = una PR
- Code review antes de mergear a main

---

## 🚀 CÓMO USAR ESTE ROADMAP

1. Copiar la sección del feature actual
2. Cambiar estado 🔴 TODO → 🟡 IN PROGRESS
3. Ir completando checkboxes
4. Al terminar: 🟡 IN PROGRESS → 🟢 DONE
5. Actualizar tabla de estado y % completo
6. Commit: `docs: update roadmap - [feature name]`

**Ejemplo:**
```
feat: implement keyboard shortcuts

✅ Alt + 1-9 working
✅ Space bar play/pause
🚧 Alt + V voice recording
⏳ Toast notifications
```

---

## 📞 CONTACTO Y PREGUNTAS

Si hay dudas sobre alguna feature o necesitas clarificar requisitos, crear un issue o comentario en el PR correspondiente.

**Última revisión:** 26/02/2026
