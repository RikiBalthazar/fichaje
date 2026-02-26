# 📋 Roadmap de Desarrollo - Sistema de Control de Partes

## 📅 Última actualización: 26 de Febrero de 2026

---

## ✅ PROGRESO GENERAL
- ✅ Sprint 1: 100% Completo (4/4 features)
- 🔄 Sprint 2: 33% Completo (1/3 features) - EN CURSO
- ❌ Sprint 3: No iniciado
- ❌ Sprint 4: No iniciado

---

## ✅ SPRINTS PLANIFICADOS

### 🚀 **SPRINT 1: PRODUCTIVIDAD INMEDIATA** (Semana 1-2)
**Objetivo:** Reducir tiempo de interacción y mejorar velocidad de uso

#### 1️⃣ **Atajos de Teclado** - ✅ COMPLETADO
**Descripción:** Sistema de atajos de teclado para maximizar velocidad
- [x] Alt + 1-9: Iniciar proyecto rápido (proyectos numerados por orden de aparición)
- [x] Espacio: Play/Pause del proyecto activo
- [x] Alt + V: Grabar descripción sin abrir modal
  - [x] Toast notification en esquina inferior derecha
  - [x] Confirmar grabación correcta con icono ✓
  - [x] Auto-guardado en BD
- [x] Esc: Detener timer activo
- [x] Mostrar ayuda de atajos: ? o Help

**Notas técnicas:**
- ✅ Hook customizado `useKeyboardShortcuts` con `useEffect` + `addEventListener`
- ✅ Toast component reutilizable (success/error/info/warning)
- ✅ Modal `KeyboardHelp` para mostrar todos los atajos
- ✅ Integración en App.tsx, desactiva con modales abiertos
- ✅ Build exitoso, listo para producción

**Dependencias:** Ninguna - ✅ COMPLETADO

**Fecha de completación:** 26 de Febrero de 2026

---

#### 2️⃣ **Proyectos Favoritos/Recientes** - ✅ COMPLETADO
**Descripción:** Ordenar proyectos por favoritos y acceso rápido
- [x] Icono de pin (⭐) en cada tarjeta para marcar favoritos
- [x] Actualizarse en tiempo real en el cliente
- [x] Guardar estado de favoritos en BD (columna `is_favorite` en projects)
- [x] Ordenar por: Favoritos → Recientes → Resto
- [x] Badge con horas trabajadas hoy
- [x] Indicador de "activo hoy" (diferente color si usaron hoy)

**Notas técnicas:**
- ✅ Agregada columna `is_favorite INTEGER DEFAULT 0` a tabla projects
- ✅ Agregada columna `last_used_at TEXT` para tracking de uso reciente
- ✅ Creado endpoint PATCH /api/projects/:id/favorite
- ✅ Timer actualiza `last_used_at` cuando se inicia un proyecto
- ✅ Ordenamiento: Favoritos → Recientes (por lastUsedAt) → Alfabético
- ✅ Badge "🕐 2h 30m hoy" muestra horas trabajadas hoy
- ✅ Indicador "● Activo hoy" si lastUsedAt es hoy
- ✅ Estrella llena (⭐) para favoritos, vacía (☆) para no favoritos

**Dependencias:** Base de datos - ✅ COMPLETADO

**Fecha de completación:** 26 de Febrero de 2026

---

#### 3️⃣ **Búsqueda y Filtros Rápidos** - ✅ COMPLETADO
**Descripción:** Encontrar proyectos rápidamente
- [x] Barra de búsqueda en header (como Ctrl + K)
- [x] Búsqueda por nombre/descripción
- [x] Filtrar por tags (pendiente - requiere Feature 4)
- [x] Limpiar búsqueda con X
- [x] Mostrar "0 resultados" si no hay coincidencias
- [x] Debounce de 300ms en búsqueda

**Notas técnicas:**
- ✅ Creado componente SearchBar reutilizable con debounce
- ✅ Filtrado con useMemo para optimizar rendimiento
- ✅ Keyboard shortcut Ctrl+K para focus en búsqueda
- ✅ Búsqueda por nombre y descripción de proyectos
- ✅ Botón X para limpiar búsqueda
- ✅ Estado vacío con mensaje y botón para limpiar
- ✅ Responsive: visible en desktop header y móvil antes del grid

**Dependencias:** Ninguna (se puede hacer local en cliente) - ✅ COMPLETADO

**Fecha de completación:** 26 de Febrero de 2026

---

#### 4️⃣ **Tags en Proyectos** - ✅ COMPLETADO
**Descripción:** Clasificar proyectos con etiquetas
- [x] Campo de tags en formulario de nuevo proyecto (input con pills)
- [x] Guardar tags comma-separated o JSON en BD
- [x] Mostrar tags coloreados en tarjeta del proyecto
- [x] Filtrar proyectos por tags (botones de filtro con colores)
- [x] Sugerencias de tags existentes al escribir
- [x] Gestión completa de tags personalizados (CRUD)
- [x] Panel de administración en Settings → Tags
- [x] 12 colores predefinidos con botones visuales
- [x] Autocompletado en formularios de proyectos

**Notas técnicas:**
- ✅ Agregada columna `tags TEXT DEFAULT "[]"` en tabla projects (JSON array)
- ✅ Creada tabla `user_tags` (id, user_id, name, color, created_at)
- ✅ Componente TagInput reutilizable con autocompletado
- ✅ Componente TagManagement para CRUD de tags
- ✅ API completa: GET/POST/PUT/DELETE /api/tags
- ✅ API: PATCH /api/projects/:id/tags
- ✅ Filtrado por tags en vista principal (reemplaza búsqueda por texto)
- ✅ 12 presets de colores con clases Tailwind CSS
- ✅ Tags visibles en ProjectCard con badges coloreados
- ✅ Fixes: autenticación (authToken), layout del color picker, button types

**Dependencias:** Base de datos - ✅ COMPLETADO

**Fecha de completación:** 26 de Febrero de 2026

---

### 📊 **SPRINT 2: ANALÍTICA Y ALERTAS** (Semana 3-4)
**Objetivo:** Visualizar datos y alertar sobre límites de tiempo

#### 5️⃣ **Notificaciones y Alertas** - ✅ COMPLETADO
**Descripción:** Alertar cuando se supera límite de horas
- [x] Push notification cuando pasas de 8:30 horas en un día
  - [x] Solicitar permiso al usuario (al cargar la app)
  - [x] Toast visual en app (esquina inferior derecha)
  - [x] Mensaje: "⚠️ Has trabajado Xh Ym hoy. Considera tomar un descanso"
- [x] Verificación cada minuto cuando timer está activo
- [x] No repetir notificación si ya se mostró en el día
- [x] Toast persistente (no se auto-cierra) con botón de cerrar

**Notas técnicas:**
- ✅ Hook customizado `useWorkingHoursAlert` con detección automática
- ✅ Web Notifications API con permisos solicitados al inicio
- ✅ Guardado de timestamp en localStorage por día
- ✅ Cálculo total: minutos registrados + segundos del timer activo
- ✅ Límite: 8.5 horas (30600 segundos)
- ✅ Verificación cada 60 segundos mientras timer corre
- ✅ Toast con duration=0 para alertas críticas (no auto-dismiss)
- ✅ Botón de cerrar manual en toasts persistentes

**Dependencias:** Web Notifications API - ✅ COMPLETADO

**Fecha de completación:** 26 de Febrero de 2026

---

#### 6️⃣ **Dashboard Mejorado** - ❌ NO INICIADO
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

#### 7️⃣ **Objetivos y Metas por Proyecto** - ❌ NO INICIADO
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
| Atajos de Teclado | � DONE | 100% | 1 |
| Proyectos Favoritos/Recientes | 🟢 DONE | 100% | 1 |
| Búsqueda y Filtros | 🟢 DONE | 100% | 1 |
| Tags en Proyectos | 🟢 DONE | 100% | 1 |
| Notificaciones de Límite 8:30h | 🟢 DONE | 100% | 2 |
| Dashboard Mejorado | 🔴 TODO | 0% | 2 |
| Objetivos y Metas | 🔴 TODO | 0% | 2 |
| PWA y Multi-dispositivo | 🔴 TODO | 0% | 3 |
| Optimizaciones de Rendimiento | 🔴 TODO | 0% | 4 |
| Backup y Seguridad | 🔴 TODO | 0% | 4 |

**Leyenda:** 🔴 TODO | 🟡 IN PROGRESS | 🟢 DONE

---

## 📋 CHECKPOINTS DE REVISIÓN

### Fin de Sprint 1 ✅ COMPLETADO
- [x] Todos los atajos funcionan sin conflictos
- [x] Búsqueda tiene < 100ms de lag (reemplazada por filtro de tags)
- [x] Favoritos se actualizan en tiempo real
- [x] Tags funcionan con colores y filtros
- [x] Sistema de gestión de tags personalizado completo

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
