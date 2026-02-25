# ⚡ Quick Start - Guía de arranque rápido

## 🎯 En 3 pasos tienes la app ejecutándose

### Paso 1: Instalar dependencias

**En Windows - Doble click en:**
```
install.bat
```

**O manualmente:**
```bash
cd c:\Users\ricar\Desktop\Sistema\ fichaje
npm install
cd server && npm install && cd ../client && npm install
```

### Paso 2: Iniciar el servidor

**En Windows - Doble click en:**
```
start-server.bat
```

**O manualmente:**
```bash
cd server
npm run dev
```

Debería ver:
```
✅ Database initialized
✅ Servidor ejecutándose en http://localhost:3000
📚 API base: http://localhost:3000/api
```

### Paso 3: Iniciar el cliente (en otra terminal)

**En Windows - Doble click en:**
```
start-client.bat
```

**O manualmente:**
```bash
cd client
npm run dev
```

Abre en tu navegador: **http://localhost:5173**

---

## ✅ Checklist de verificación

- [ ] Base de datos SQLite creada (`server/data.db`)
- [ ] Servidor respondiendo en `http://localhost:3000/api`
- [ ] Cliente cargando en `http://localhost:5173`
- [ ] ✅ Health check: `GET http://localhost:3000/api/health` → `{ "status": "ok" }`

---

## 🎮 Prueba la app

### 1. Crear un proyecto
- Click en **"➕ Nuevo Proyecto"**
- Nombre: `Mi Primer Proyecto`
- Click **"Crear"**

### 2. Iniciar cronómetro
- En la tarjeta del proyecto, click **"▶ Iniciar"**
- Observa como cuenta los segundos

### 3. Agregar descripción por voz
- Click en **"🎤 Descripción"**
- Click en **"Grabar voz"**
- Habla: "Estoy trabajando en la interfaz"
- El texto aparecerá automático
- Click **"Guardar descripción"**

### 4. Detener y guardar
- Click en **"⏹️ Detener"**
- El tiempo se guardará
- Verás el tiempo en formato centesimal (ej: 0:50 para 30 min)

### 5. Ver registros
- Click en **"📋 Administración"**
- Verás tabla con todos los registros
- Puedes editar o eliminar

### 6. Exportar
- Click en **"📥 Exportar TXT"**
- Se descargará un archivo `fichaje-FECHA.txt`
- Formato: UTF-8, ordenado por fecha

---

## 🐛 Solución de problemas

### Error: "Puerto 3000 ya está en uso"
```bash
# Cambia el puerto en server/src/index.ts
const PORT = 3001;  // En lugar de 3000
```

### Error: "npm: comando no encontrado"
- Instala Node.js desde https://nodejs.org/
- Reinicia la terminal

### El cliente no es accesible a través de `http://localhost:5173`
- Asegúrate de que el servidor está corriendo en otra terminal
- Revisa que ambas terminales ejecutan en carpetas correctas

### Micrófono no funciona
- Comprueba permisos del navegador
- Algunos navegadores requieren HTTPS en producción
- Chrome/Edge trabajan mejor localmente

### Base de datos vacía al reiniciar
- Los proyectos se guardan en `server/data.db`
- Si la eliminas, se crea nueva (vacía)
- Los datos del localStorage del cliente se pierden por sesión

---

## 📖 Documentación disponible

| Documento | Para qué |
|-----------|---------|
| **README.md** | Guía completa de instalación y uso |
| **TECHNICAL.md** | Cómo funciona internamente |
| **API_EXAMPLES.md** | Ejemplos de llamadas API |
| **PROJECT_STRUCTURE.md** | Estructura de archivos |
| **CONTRIBUTING.md** | Cómo contribuir código |

---

## 🔧 Comandos útiles

```bash
# Desarrollo
npm run dev              # Arranca servidor + cliente simultáneamente
npm run dev:server      # Solo servidor
npm run dev:client      # Solo cliente

# Build producción
npm run build           # Compila ambos
npm run build:server    # Compila servidor
npm run build:client    # Compila cliente

# Testing
npm test                # Ejecuta tests de conversión centesimal
npm run test:centesimal # Lo mismo en servidor

# Instalar
npm install-all         # Instala todo (raíz, server, client)
```

---

## 🎯 Próximas cosas que puedes hacer

1. **Crear varios proyectos** y practicar con el cronómetro
2. **Revisar la BD**: Abre `server/data.db` con SQLiteBrowser
3. **Explorar la API**: Usa curl o Postman en http://localhost:3000/api
4. **Modificar estilos**: TailwindCSS en `client/src/index.css`
5. **Entender la lógica**: Lee `TECHNICAL.md`

---

## 💡 Tips

- **localStorage**: Timer persiste incluso cerrando la browser
- **Centesimal**: 90 minutos = 1:50 (no 1:30)
- **Un solo timer**: Si inicia otro proyecto, el anterior se pausa
- **Voz**: Escucha con permisos, en idioma español

---

## 🚀 Listo?

Si ves esto y todo funciona:

```
✅ Servidor corriendo
✅ Cliente visible
✅ Proyecto creado
✅ Timer registrando
```

**¡Enhorabuena!** Tu aplicación de tiempo tracking está lista para usar. 🎉

---

## ❓ ¿Necesitas ayuda?

1. **Instalación**: Lee `README.md`
2. **Cómo funciona**: Lee `TECHNICAL.md`
3. **API**: Consulta `API_EXAMPLES.md`
4. **Estructura**: Mira `PROJECT_STRUCTURE.md`

---

**Happy tracking!** ⏱️
