import { useState, useEffect, useCallback, useRef } from 'react';
import { TimerState, TimerStateResponse } from '../types';
import { timerAPI } from '../services/api';

export function useTimer(enabled = true) {
  const [timerState, setTimerState] = useState<TimerState>({
    projectId: null,
    isRunning: false,
    elapsedSeconds: 0,
    startedAt: 0
  });
  const [pausedTimers, setPausedTimers] = useState<Record<string, number>>({});
  const [serverState, setServerState] = useState<TimerStateResponse>({
    active: null,
    paused: []
  });
  const [tick, setTick] = useState(0);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const tickRef = useRef<NodeJS.Timeout | null>(null);

  const syncState = useCallback(async () => {
    if (!enabled) return;
    try {
      const state = await timerAPI.getState();
      setServerState(state);
    } catch (error) {
      console.error('Error syncing timer state:', error);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    syncState();

    pollRef.current = setInterval(() => {
      syncState();
    }, 10000);

    tickRef.current = setInterval(() => {
      setTick(Date.now());
    }, 1000);

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
    };
  }, [enabled, syncState]);

  useEffect(() => {
    const active = serverState.active;
    if (!active) {
      setTimerState({
        projectId: null,
        isRunning: false,
        elapsedSeconds: 0,
        startedAt: 0
      });
    } else {
      const startedAtMs = new Date(active.startedAt).getTime();
      const elapsedSeconds = active.accumulatedSeconds + Math.max(0, Math.floor((Date.now() - startedAtMs) / 1000));
      setTimerState({
        projectId: active.projectId,
        isRunning: true,
        elapsedSeconds,
        startedAt: startedAtMs
      });
    }

    const pausedMap: Record<string, number> = {};
    serverState.paused.forEach((timer) => {
      pausedMap[timer.projectId] = timer.accumulatedSeconds;
    });
    setPausedTimers(pausedMap);
  }, [serverState, tick]);

  const start = useCallback(async (projectId: string) => {
    if (!enabled) return;
    const state = await timerAPI.start(projectId);
    setServerState(state);
  }, [enabled]);

  const pause = useCallback(async () => {
    if (!enabled) return;
    const state = await timerAPI.pause();
    setServerState(state);
  }, [enabled]);

  const stop = useCallback(async (projectId: string, description: string) => {
    if (!enabled) return null;
    const result = await timerAPI.stop(projectId, description);
    if (result?.state) {
      setServerState(result.state);
    }
    return result?.entry || null;
  }, [enabled]);

  return {
    timerState,
    pausedTimers,
    start,
    pause,
    stop,
    syncState
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
