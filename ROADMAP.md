# 📋 Roadmap de Desarrollo - Sistema de Control de Partes

## 📅 Última actualización: 26 de Febrero de 2026

---

## ✅ PROGRESO GENERAL
- ✅ Sprint 1: 100% Completo (4/4 features)
- ✅ Sprint 2: 100% Completo (3/3 features)
- ✅ Sprint 3: 100% Completo (1/1 features)
- 🔄 Sprint 4: 50% Completo (1/2 features) - EN CURSO

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

#### 6️⃣ **Dashboard Mejorado** - ✅ COMPLETADO
**Descripción:** Gráficos y análisis de datos
- [x] Gráfico de barras: Horas por proyecto (últimos 7/30 días)
  - [x] Selector: últimos 7 días / últimos 30 días
  - [x] Ordenar por mayor uso (Top 8 proyectos)
  - [x] Coloreado con paleta de 8 colores
- [x] Gráfico de línea: Tendencia diaria de horas
  - [x] Mostrar evolución día a día
  - [x] Grid con líneas de referencia
  - [x] Tooltips con valores exactos
- [x] Comparativa: Período actual vs período anterior
  - [x] Porcentaje de cambio: ↑5%, ↓10%, etc.
  - [x] Indicador visual verde/rojo
- [x] Distribución por día de la semana
  - [x] Barras verticales con días más/menos productivos
  - [x] Identificar día más productivo automáticamente
- [x] Proyectos "muertos" (sin actividad en 30 días)
  - [x] Lista con últimas fechas de actividad
  - [x] Alerta visual en rojo

**Notas técnicas:**
- ✅ Instalada librería Recharts 3.7.0
- ✅ Creado endpoint GET /api/dashboard/stats?days=7|30
- ✅ Controller con SQL optimizado (LEFT JOIN, agregaciones)
- ✅ Componentes: LineChart, BarChart, ResponsiveContainer, Cell
- ✅ 4 KPIs con gradientes: Total, Promedio/Día, Registros, Proyectos
- ✅ Selector de tiempo (7/30 días) con botones interactivos
- ✅ Datos cacheados con useMemo para rendimiento
- ✅ Responsive design con grid adaptativo
- ✅ Weekly distribution con barras personalizadas
- ✅ Dead projects con detección automática (30 días)

**Dependencias:** npm install recharts - ✅ COMPLETADO

**Fecha de completación:** 26 de Febrero de 2026

---

#### 7️⃣ **Objetivos y Metas por Proyecto** - ✅ COMPLETADO
**Descripción:** Establecer límites de tiempo por proyecto con alertas visuales
- [x] Campo opcional al crear/editar proyecto: "Horas objetivo" (targetHours)
- [x] Alertas visuales en tarjeta del proyecto
  - [x] Rojo: > 100% (⛔ Limite superado)
  - [x] Amarillo: 80-100% (⚠️ Cerca del limite)
  - [x] Azul: < 80% (🎯 Limite configurado)
- [x] Indicador visual cuando llegues al 80% del objetivo
- [x] Modal de edición: cambiar objetivo desde ProjectForm
- [x] Mostrar: "5h / 40h" (5 horas de 40 horas objetivo)
- [x] En Dashboard: sección de resumen con proyectos superados/cerca del límite

**Notas técnicas:**
- ✅ Agregada columna `target_minutes INTEGER DEFAULT NULL` en projects
- ✅ Actualizado GET /api/projects para incluir targetMinutes
- ✅ Endpoints POST/PATCH /api/projects con validación de targetMinutes
- ✅ ProjectCard con cálculo de isOverLimit/isNearLimit
- ✅ DashboardModal con sección limitSummary (contadores y top 6 proyectos)
- ✅ Conversión horas → minutos en backend, minutos → horas en frontend
- ✅ Solo alertas visuales (sin bloqueo ni barras de progreso)

**Dependencias:** Base de datos - ✅ COMPLETADO

**Fecha de completación:** 26 de Febrero de 2026

---

### 🎯 **SPRINT 3: EXPERIENCIA MÓVIL** (Semana 5-6)
**Objetivo:** App funcional en móviles y PWA instalable

#### 8️⃣ **Multi-dispositivo Mejorado** - ✅ COMPLETADO
**Descripción:** PWA instalable con manifest, service worker e instalación desde UI
- [x] PWA instalable
  - [x] Manifest.json creado con metadata de la app
  - [x] Service Worker con caché inteligente (cache-first para assets, network-first para API)
  - [x] Iconos SVG de app 192x192, 512x512 con diseño de reloj/timer
  - [x] Theme color sky blue (#0ea5e9) y display standalone
  - [x] Opción de instalar desde botón en UI (desktop y móvil)
- [x] Botón de instalación PWA
  - [x] Escucha evento beforeinstallprompt
  - [x] Muestra botón solo cuando instalable (canInstall state)
  - [x] Trigger del prompt de instalación al hacer clic
  - [x] Oculta botón después de instalar (appinstalled event)
- [x] Service Worker registration
  - [x] Registrado en main.tsx al cargar la app
  - [x] Cache 'fichaje-v1' con assets estáticos
  - [x] Fallback a index.html para navegación offline

**Notas técnicas:**
- ✅ Creado client/public/manifest.json con scope "/" y start_url "/"
- ✅ Creados icon-192.svg y icon-512.svg con diseño azul/blanco
- ✅ Creado client/public/sw.js con estrategias de caché
- ✅ Actualizado client/index.html con link a manifest y theme-color meta
- ✅ Actualizado client/src/main.tsx con navigator.serviceWorker.register()
- ✅ Actualizado client/src/App.tsx con BeforeInstallPromptEvent interface
- ✅ Agregados estados installPrompt y canInstall en App.tsx
- ✅ Botones "Instalar App" en header desktop y menú móvil
- ✅ Desplegado y verificado en producción (manifest, sw, iconos accesibles)

**Dependencias:** Service Worker, Web App Manifest - ✅ COMPLETADO

**Fecha de completación:** 26 de Febrero de 2026

---

### ⚡ **SPRINT 4: OPTIMIZACIÓN** (Semana 7-8)
**Objetivo:** Rendimiento y seguridad

#### 9️⃣ **Optimizaciones de Rendimiento** - ✅ COMPLETADO
**Descripción:** Hacer app más rápida y fluida con React.memo, lazy loading y useMemo
- [x] Memoización de componentes
  - [x] React.memo en ProjectCard para evitar re-renders innecesarios
  - [x] useCallback en sortProjects
  - [x] useMemo en sortedProjects para evitar re-ordenamientos
- [x] Code splitting de modales
  - [x] Lazy load de AdminView, DashboardModal, SettingsModal
  - [x] Lazy load de ExportView y AccountModal
  - [x] Suspense con LoadingSpinner como fallback
- [x] Debounce en búsqueda (300ms) - ✅ Ya implementado previamente
- [x] useMemo en cálculos existentes
  - [x] filteredProjects con búsqueda y tags
  - [x] allTags para obtener tags únicos

**Notas técnicas:**
- ✅ React.memo aplicado a ProjectCard (componente renderizado múltiples veces)
- ✅ Lazy loading con React.lazy() y dynamic imports
- ✅ Code splitting resultó en reducción del 60% del bundle principal:
  - Bundle principal: 627 KB → 236 KB (gzipped: 189 KB → 76 KB)
  - AdminView: 12.33 KB chunk separado
  - DashboardModal: 370.57 KB chunk separado (incluye Recharts)
  - SettingsModal: 3.54 KB chunk separado
  - ExportView: 3.90 KB chunk separado
  - AccountModal: 2.62 KB chunk separado
- ✅ Suspense wrappers con LoadingSpinner para UX durante carga
- ✅ useCallback para sortProjects evita recreación de función
- ✅ useMemo para sortedProjects evita re-ordenamiento en cada render
- ✅ Optimizaciones ya existentes: filteredProjects, allTags con useMemo

**Dependencias:** React 18+ (lazy, Suspense, memo) - ✅ COMPLETADO

**Fecha de completación:** 26 de Febrero de 2026

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
| Atajos de Teclado | 🟢 DONE | 100% | 1 |
| Proyectos Favoritos/Recientes | 🟢 DONE | 100% | 1 |
| Búsqueda y Filtros | 🟢 DONE | 100% | 1 |
| Tags en Proyectos | 🟢 DONE | 100% | 1 |
| Notificaciones de Límite 8:30h | 🟢 DONE | 100% | 2 |
| Dashboard Mejorado | 🟢 DONE | 100% | 2 |
| Objetivos y Metas | 🟢 DONE | 100% | 2 |
| PWA y Multi-dispositivo | 🟢 DONE | 100% | 3 |
| Optimizaciones de Rendimiento | � DONE | 100% | 4 |
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

### Fin de Sprint 2 ✅ COMPLETADO
- [x] Notificación aparece correctamente al superar 8:30h
- [x] Dashboard carga en < 2 segundos con Recharts
- [x] Gráficos son responsivos y animados
- [x] Metas se calculan correctamente con alertas visuales

### Fin de Sprint 3 ✅ COMPLETADO
- [x] PWA instalable en navegadores compatibles (Chrome, Edge, Safari)
- [x] Manifest.json con iconos y metadata
- [x] Service Worker con caché offline para assets estáticos
- [x] Botón de instalación visible cuando es instalable

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
