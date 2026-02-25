import { useState, useEffect, useCallback, useRef } from 'react';
import { TimerState } from '../types';

export function useTimer() {
  const [timerState, setTimerState] = useState<TimerState>({
    projectId: null,
    isRunning: false,
    elapsedSeconds: 0,
    startedAt: 0
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Restaurar timer del localStorage si existe
  useEffect(() => {
    const saved = localStorage.getItem('timerState');
    if (saved) {
      try {
        const state = JSON.parse(saved);
        setTimerState(state);
        if (state.isRunning) {
          // El timer estaba corriendo, reiniciarlo
          const elapsedSinceClose = Math.floor((Date.now() - state.startedAt) / 1000);
          setTimerState(prev => ({
            ...prev,
            elapsedSeconds: prev.elapsedSeconds + elapsedSinceClose
          }));
        }
      } catch (e) {
        console.error('Error restoring timer state:', e);
      }
    }
  }, []);

  // Guardar timer en localStorage
  useEffect(() => {
    localStorage.setItem('timerState', JSON.stringify(timerState));
  }, [timerState]);

  // Incrementar timer cada segundo
  useEffect(() => {
    if (!timerState.isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimerState(prev => ({
        ...prev,
        elapsedSeconds: prev.elapsedSeconds + 1
      }));
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [timerState.isRunning]);

  const start = useCallback((projectId: string, initialElapsedSeconds = 0) => {
    // Pausar cualquier timer anterior
    setTimerState(() => ({
      projectId,
      isRunning: true,
      elapsedSeconds: initialElapsedSeconds,
      startedAt: Date.now() - initialElapsedSeconds * 1000
    }));
  }, []);

  const pause = useCallback(() => {
    setTimerState(prev => ({
      ...prev,
      isRunning: false
    }));
  }, []);

  const reset = useCallback(() => {
    setTimerState({
      projectId: null,
      isRunning: false,
      elapsedSeconds: 0,
      startedAt: 0
    });
    localStorage.removeItem('timerState');
  }, []);

  const stop = useCallback((): { projectId: string; elapsedSeconds: number } | null => {
    if (!timerState.projectId) return null;
    
    const result = {
      projectId: timerState.projectId,
      elapsedSeconds: timerState.elapsedSeconds
    };

    reset();
    return result;
  }, [timerState.projectId, timerState.elapsedSeconds, reset]);

  return {
    timerState,
    start,
    pause,
    reset,
    stop
  };
}

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown');
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false); // Ref para tracking interno sincronizado

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech Recognition API no soportada en este navegador');
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'es-ES';

    recognitionRef.current.onstart = () => {
      console.log('🎤 [Hook] onstart - Recognition iniciado');
      isListeningRef.current = true;
      setIsListening(true);
      setError(null);
    };

    recognitionRef.current.onaudiostart = () => {
      console.log('🔊 [Hook] onaudiostart - Micrófono detectando audio');
    };

    recognitionRef.current.onsoundstart = () => {
      console.log('🔉 [Hook] onsoundstart - Sonido detectado');
    };

    recognitionRef.current.onspeechstart = () => {
      console.log('🗣️ [Hook] onspeechstart - Voz detectada');
    };

    recognitionRef.current.onspeechend = () => {
      console.log('🗣️ [Hook] onspeechend - Voz terminada');
    };

    recognitionRef.current.onsoundend = () => {
      console.log('🔉 [Hook] onsoundend - Sonido terminado');
    };

    recognitionRef.current.onaudioend = () => {
      console.log('🔊 [Hook] onaudioend - Audio terminado');
    };

    recognitionRef.current.onresult = (event: any) => {
      console.log('🎙️ [Hook] onresult event:', event.results.length, 'items');
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        console.log(`  resultado ${i}: "${transcript}" (final: ${event.results[i].isFinal})`);
        
        if (event.results[i].isFinal) {
          setTranscript((prev) => {
            const newTranscript = prev + (prev ? ' ' : '') + transcript;
            console.log('📝 [Hook] Actualizando transcript (final):', newTranscript);
            return newTranscript;
          });
        } else {
          interimTranscript += transcript;
        }
      }
      
      // Mostrar interim transcript en tiempo real (sin actualizar state)
      if (interimTranscript) {
        console.log('💭 [Hook] Interim:', interimTranscript);
      }
    };

    recognitionRef.current.onerror = (event: any) => {
      isListeningRef.current = false;
      console.error('Speech recognition error:', event.error);
      if (event.error === 'network') {
        setError('Error de conexión');
      } else if (event.error === 'no-speech') {
        setError('No se detectó voz');
      } else if (event.error === 'not-allowed') {
        setError('Permiso de micrófono denegado');
      } else if (event.error !== 'aborted') {
        setError(`Error: ${event.error}`);
      }
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      isListeningRef.current = false;
      setIsListening(false);
    };

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // Ignorar errores al limpiar
        }
        isListeningRef.current = false;
      }
    };
  }, []);

  const startListening = useCallback(() => {
    // Usar ref en lugar de state para evitar desfases
    if (recognitionRef.current && !isListeningRef.current) {
      try {
        console.log('🎤 [Hook] Iniciando grabación...');
        recognitionRef.current.start();
        // Actualizar ambos: ref para sincronía y state para React
        isListeningRef.current = true;
        setIsListening(true); // Garantizar actualización inmediata
        console.log('🎤 [Hook] Estado actualizado - isListening: true');
      } catch (e: any) {
        // Si ya estaba iniciado, ignorar el error
        if (e.name === 'InvalidStateError') {
          console.warn('🎤 [Hook] Speech recognition already started');
          isListeningRef.current = true;
          setIsListening(true);
        } else {
          console.error('❌ [Hook] Error starting speech recognition:', e);
          setError('Error al iniciar micrófono');
        }
      }
    }
  }, []); // Sin dependencias ya que usamos ref

  const stopListening = useCallback(() => {
    // Usar ref para evitar desfases
    if (recognitionRef.current && isListeningRef.current) {
      try {
        console.log('⏹️ [Hook] Deteniendo grabación...');
        recognitionRef.current.stop();
        isListeningRef.current = false;
        setIsListening(false); // Garantizar actualización inmediata
        console.log('⏹️ [Hook] Estado actualizado - isListening: false');
      } catch (e) {
        console.error('❌ [Hook] Error stopping speech recognition:', e);
        isListeningRef.current = false;
        setIsListening(false);
      }
    }
  }, []); // Sin dependencias ya que usamos ref

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setError(null);
  }, []);

  const requestPermission = useCallback(async () => {
    try {
      console.log('🎤 [Hook] Solicitando permisos de micrófono...');
      
      // Listar dispositivos de audio disponibles
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter(device => device.kind === 'audioinput');
      console.log('🎧 [Hook] Dispositivos de audio encontrados:', audioInputs.length);
      audioInputs.forEach((device, i) => {
        console.log(`  ${i + 1}. ${device.label || 'Micrófono sin nombre'} (${device.deviceId})`);
      });
      
      if (audioInputs.length === 0) {
        setError('No se encontró ningún micrófono conectado');
        return false;
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('✅ [Hook] Permisos concedidos');
      console.log('🎙️ [Hook] Stream de audio activo:', stream.active);
      console.log('🎙️ [Hook] Tracks:', stream.getAudioTracks().length);
      
      setPermissionStatus('granted');
      setError(null);
      
      // Detener el stream inmediatamente
      stream.getTracks().forEach(track => {
        console.log(`⏹️ [Hook] Deteniendo track: ${track.label}`);
        track.stop();
      });
      
      return true;
    } catch (err: any) {
      console.error('❌ [Hook] Error al solicitar permisos:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionStatus('denied');
        setError('Permiso de micrófono denegado. Revisa la configuración del navegador.');
      } else if (err.name === 'NotFoundError') {
        setError('No se encontró ningún micrófono. Verifica que esté conectado.');
      } else {
        setError(`Error: ${err.message}`);
      }
      return false;
    }
  }, []);

  return {
    isListening,
    transcript,
    error,
    permissionStatus,
    startListening,
    stopListening,
    resetTranscript,
    setTranscript,
    requestPermission,
  };
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
}
