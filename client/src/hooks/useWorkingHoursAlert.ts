import { useEffect, useCallback } from 'react';

interface UseWorkingHoursAlertProps {
  elapsedSeconds: number; // Segundos trabajados hoy en el timer activo
  totalMinutesToday: number; // Total de minutos trabajados hoy (registrados)
  timerRunning: boolean; // Si el timer está corriendo
  onAlert?: (message: string) => void; // Callback para mostrar toast
}

const WORKING_HOURS_LIMIT = 8.5 * 60 * 60; // 8:30 en segundos
const ALERT_KEY = `last_alert_${new Date().toDateString()}`; // Clave única por día

export const useWorkingHoursAlert = ({
  elapsedSeconds,
  totalMinutesToday,
  timerRunning,
  onAlert
}: UseWorkingHoursAlertProps) => {
  const getTotalSecondsToday = useCallback(() => {
    // Total = minutos registrados hoy + segundos del timer actual
    return totalMinutesToday * 60 + elapsedSeconds;
  }, [totalMinutesToday, elapsedSeconds]);

  const checkAndAlert = useCallback(() => {
    const totalSeconds = getTotalSecondsToday();
    const hasAlreadyAlerted = localStorage.getItem(ALERT_KEY) === 'true';

    console.log(`⏱️ Control de horas: ${totalSeconds}s (8:30h límite = ${WORKING_HOURS_LIMIT}s)`);
    console.log(`📌 Ya alertado hoy: ${hasAlreadyAlerted}`);

    if (totalSeconds >= WORKING_HOURS_LIMIT && !hasAlreadyAlerted) {
      console.log('🚨 ALERTA: ¡Límite de 8:30 horas superado!');

      // Marcar que ya se mostró la alerta hoy
      localStorage.setItem(ALERT_KEY, 'true');

      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const message = `⚠️ Has trabajado ${hours}h ${minutes}m hoy. Considera tomar un descanso`;

      // Mostrar toast
      if (onAlert) {
        onAlert(message);
      }

      // Intentar mostrar Web Notification si está permitido
      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification('⚠️ Sistema Fichaje - Límite de Horas', {
            body: message,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: 'working-hours-alert', // Prevenir duplicadas
            requireInteraction: true // Mantener hasta que usuario interactúe
          });
          console.log('✅ Push notification enviada');
        } catch (error) {
          console.error('❌ Error al enviar notificación:', error);
        }
      }
    }
  }, [getTotalSecondsToday, onAlert]);

  // Verificar cada vez que cambian las horas (throttle a cada minuto cuando está activo)
  useEffect(() => {
    if (!timerRunning) return;

    // Verificar inmediatamente cuando timer empieza a correr
    checkAndAlert();

    // Luego verificar cada minuto
    const intervalId = setInterval(() => {
      checkAndAlert();
    }, 60000);

    return () => clearInterval(intervalId);
  }, [timerRunning, checkAndAlert]);

  // Solicitar permiso para notificaciones al montar el hook
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      console.log('📢 Solicitando permisos de notificación...');
      Notification.requestPermission().then(permission => {
        console.log(`📌 Permiso de notificación: ${permission}`);
      });
    }
  }, []);

  return {
    totalSecondsToday: getTotalSecondsToday(),
    hoursFormatted: (() => {
      const totalSeconds = getTotalSecondsToday();
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    })()
  };
};

// Helper para resetear la alerta diaria (útil para testing)
export const resetDailyAlert = () => {
  localStorage.removeItem(ALERT_KEY);
  console.log('🔄 Alerta diaria resetada');
};
