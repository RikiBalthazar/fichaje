# 🎤 Guía de solución de problemas del micrófono

## Problema: El micrófono no captura texto

### Síntomas
- El botón "Empezar a grabar" se vuelve rojo pulsante ✅
- Los permisos se conceden correctamente ✅
- **PERO** no aparece texto en el campo de descripción ❌
- En la consola del navegador NO aparecen estos eventos:
  - `🔊 [Hook] onaudiostart`
  - `🗣️ [Hook] onspeechstart`
  - `🎙️ [Hook] onresult event`

---

## 🔍 Diagnóstico

### Opera Browser - Problema conocido ⚠️

**Opera tiene problemas de compatibilidad con Web Speech API**, especialmente en versiones recientes. Aunque soporta la API técnicamente, tiene bugs que impiden la captura de audio correctamente.

**Solución recomendada:**
- ✅ Usa **Google Chrome** (mejor soporte)
- ✅ Usa **Microsoft Edge** (excelente soporte)
- ⚠️ Firefox (soporte limitado)
- ❌ Opera (bugs conocidos)

---

## 🛠️ Soluciones

### Solución 1: Cambiar de navegador (RECOMENDADO)

1. **Descarga Chrome:** https://www.google.com/chrome/
2. **O usa Edge:** Ya viene instalado en Windows 10/11
3. Abre la aplicación en Chrome/Edge: `http://localhost:5173`
4. Concede permisos de micrófono cuando se soliciten
5. Prueba la grabación de voz

### Solución 2: Verificar micrófono en Windows

1. **Abre Configuración de Windows** → **Sistema** → **Sonido**
2. Ve a **Entrada** (Input)
3. Selecciona tu micrófono en la lista
4. **Habla** y verifica que la barra de nivel se mueva
5. Click en **"Probar el micrófono"**
6. Si no funciona ahí, el problema es de Windows/hardware

### Solución 3: Verificar permisos en Opera (si insistes en usarlo)

1. Haz click en el **candado 🔒** (izquierda de la URL)
2. Click en **"Configuración del sitio"**
3. Busca **"Micrófono"**
4. Asegúrate que esté en **"Permitir"**
5. Recarga la página (F5)

### Solución 4: Configuración global de Opera

1. Abre Opera y ve a: `opera://settings/content/microphone`
2. Asegúrate que está seleccionado:
   - ✅ **"Los sitios pueden pedir usar el micrófono"**
3. En **"Permitir"**, agrega: `http://localhost:5173`
4. Reinicia Opera completamente
5. Vuelve a intentar

### Solución 5: Workaround - Escritura manual

Si el micrófono no funciona en absoluto:

1. Abre el modal de descripción
2. **Escribe el texto manualmente** en el campo de texto
3. O usa el botón **"🧪 Test: Agregar texto de prueba"**
4. Haz click en **"Guardar descripción"**

El resto de la funcionalidad (timer, guardado, exportación) **funcionará perfectamente**.

---

## 📊 Comparación de navegadores

| Navegador | Web Speech API | Calidad | Recomendación |
|-----------|----------------|---------|---------------|
| **Chrome** | ✅ Excelente | ⭐⭐⭐⭐⭐ | **USO ESTE** |
| **Edge** | ✅ Excelente | ⭐⭐⭐⭐⭐ | **USO ESTE** |
| Firefox | ⚠️ Limitado | ⭐⭐⭐ | Funciona pero peor |
| **Opera** | ❌ Buggy | ⭐ | **NO RECOMENDADO** |
| Safari | ⚠️ Solo macOS/iOS | ⭐⭐⭐⭐ | OK en Apple |

---

## 🧪 Test de verificación

### Paso 1: Verifica que la API está disponible
En la consola del navegador (F12 → Console), ejecuta:
```javascript
'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
```
Debe devolver: `true`

### Paso 2: Verifica dispositivos de audio
```javascript
navigator.mediaDevices.enumerateDevices().then(devices => {
  console.log(devices.filter(d => d.kind === 'audioinput'));
});
```
Debe mostrar tu micrófono en la lista.

### Paso 3: Verifica permisos
```javascript
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    console.log('✅ Permisos OK');
    stream.getTracks().forEach(t => t.stop());
  })
  .catch(err => console.error('❌ Error:', err));
```
Debe mostrar `✅ Permisos OK`.

Si los 3 tests pasan pero sigue sin funcionar → **Es un bug de Opera, usa Chrome/Edge**.

---

## 🔧 Logs de debugging

Cuando uses la app, abre la **Console** (F12) y busca estos eventos:

### ✅ Funcionamiento correcto (Chrome/Edge)
```
🎤 [Hook] Iniciando grabación...
🎤 [Hook] onstart - Recognition iniciado
🔊 [Hook] onaudiostart - Micrófono detectando audio    ← ¡CLAVE!
🔉 [Hook] onsoundstart - Sonido detectado              ← ¡CLAVE!
🗣️ [Hook] onspeechstart - Voz detectada               ← ¡CLAVE!
🎙️ [Hook] onresult event: 1 items                     ← ¡CLAVE!
📝 [Hook] Actualizando transcript: "tu texto aquí"    ← ¡CLAVE!
```

### ❌ No funciona (Opera)
```
🎤 [Hook] Iniciando grabación...
🎤 [Hook] onstart - Recognition iniciado
⏹️ [Hook] Deteniendo grabación...
(no hay más eventos - el micrófono no captura nada)
```

Si ves el segundo patrón → **Opera no funciona, usa Chrome/Edge**.

---

## 💡 Recomendación final

**Para una experiencia sin problemas:**

1. **USA CHROME O EDGE** - Ambos son navegadores Chromium con excelente soporte
2. La aplicación funciona **perfectamente** en estos navegadores
3. Opera es genial para navegar, pero tiene bugs con Web Speech API
4. Si prefieres Opera, **escribe manualmente** las descripciones

---

## 📞 Soporte adicional

Si sigues teniendo problemas **incluso en Chrome/Edge**:

1. Verifica que el micrófono funcione en otras apps (Discord, Zoom, etc.)
2. Actualiza los drivers del micrófono
3. Comprueba Configuración de privacidad de Windows:
   - **Configuración** → **Privacidad** → **Micrófono**
   - Asegúrate que esté **habilitado** para aplicaciones de escritorio
4. Reinicia el PC

---

**¡Tip!** La funcionalidad de voz es **opcional**. Puedes usar toda la aplicación escribiendo descripciones manualmente y funcionará igual de bien. 🎯
