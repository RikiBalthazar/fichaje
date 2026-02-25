# 🔧 Bug Fix - Speech Recognition

## 🐛 Problema reportado

Error al pulsar el botón para registrar audio:
```
Uncaught InvalidStateError: Failed to execute 'start' on 'SpeechRecognition': 
recognition has already started.
```

Sucedía especialmente cuando se pulsaba varias veces rápidamente.

## 🔍 Causa raíz

El hook `useSpeechRecognition` tenía un **desfase de sincronización** entre:
- El estado `isListening` (que se actualiza por React)
- El estado real del `SpeechRecognition` (que es nativo del navegador)

### Secuencia del problema

1. Usuario pulsa "Grabar voz"
2. Se invoca `startListening()` → llama `recognition.start()`
3. Navegador inicia grabación y dispara evento `onstart`
4. `setIsListening(true)` se ejecuta (lenta por re-render)
5. Usuario pulsa de nuevo ANTES de que el state se actualice
6. El código ve `isListening=false` aún → intenta `start()` de nuevo ❌
7. Error: "ya está iniciado"

## ✅ Solución implementada

### Cambio 1: Usar `useRef` para tracking sincronizado

Se añadió `isListeningRef` que se actualiza **instantáneamente** sin esperar a re-renders:

```typescript
// ANTES ❌
const startListening = useCallback(() => {
  if (recognitionRef.current && !isListening) {  // Desfase aquí
    recognitionRef.current.start();
  }
}, [isListening]); // Dependencia problemática
```

```typescript
// DESPUÉS ✅
const startListening = useCallback(() => {
  if (recognitionRef.current && !isListeningRef.current) {  // Sincronizado
    try {
      recognitionRef.current.start();
      isListeningRef.current = true;
    } catch (e) {
      if (e.name === 'InvalidStateError') {
        console.warn('Speech recognition already started');
        isListeningRef.current = true;
      }
    }
  }
}, []); // Sin dependencias
```

### Cambio 2: Actualizar ref en todos los eventos

```typescript
recognitionRef.current.onstart = () => {
  isListeningRef.current = true;  // ← Actualizar ref
  setIsListening(true);           // ← Actualizar state
  setError(null);
};

recognitionRef.current.onerror = (event: any) => {
  isListeningRef.current = false; // ← Actualizar ref
  // ... resto del manejo
};

recognitionRef.current.onend = () => {
  isListeningRef.current = false; // ← Actualizar ref
  setIsListening(false);
};
```

### Cambio 3: Try-catch para errores inesperados

```typescript
try {
  recognitionRef.current.start();
} catch (e: any) {
  if (e.name === 'InvalidStateError') {
    // Ya estaba iniciado, sincronizar y continuar
    isListeningRef.current = true;
    setIsListening(true);
  } else {
    // Error real
    setError('Error al iniciar micrófono');
  }
}
```

### Cambio 4: Mejorar ProjectCard

Se añadió `handleCloseModal()` que detiene la grabación al cerrar el modal:

```typescript
const handleCloseModal = () => {
  if (isListening) {
    stopListening();
  }
  setShowDescriptionModal(false);
};
```

## 📊 Archivos modificados

1. **client/src/hooks/index.ts**
   - Añadido `isListeningRef`
   - Mejorado manejo de errores
   - Cambio en callbacks (sin dependencias problemáticas)

2. **client/src/components/ProjectCard.tsx**
   - Añadido `handleCloseModal()`
   - Mejorado `handleSaveDescription()`
   - Modal usa nuevo handler

## ✨ Resultados

✅ No hay más error "already started"
✅ Clics rápidos funcionan sin problemas
✅ Grabación se detiene al cerrar modal
✅ Mejor manejo de errores

## 🧪 Cómo probar

1. Arranca la aplicación
2. Crea un proyecto
3. Inicia cronómetro
4. Click en 🎤 "Descripción"
5. Click rápido múltiple en "Grabar voz" ← Antes fallaba, ahora funciona
6. Cierra el modal ← La grabación se detiene automáticamente
7. Reabre y vuelve a probar ← Sin errores

## 📝 Nota técnica

El problema fue usar **state** (`isListening`) para controlar comportamiento del navegador que es **asincrónico**. La solución fue usar **ref** junto con **state** para:
- **Ref**: Control rápido y sincronizado
- **State**: Actualización de UI

Este es un patrón común en React cuando trabajas con APIs nativas del navegador.
