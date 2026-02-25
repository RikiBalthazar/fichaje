/**
 * Convierte minutos a formato centesimal (0-100)
 * @param minutes Minutos totales
 * @returns Formato centesimal como string "H:MM"
 * 
 * Ejemplos:
 * 90 minutos (1h 30m) → "1:50"
 * 15 minutos → "0:25"
 * 45 minutos → "0:75"
 */
export function convertMunitesToCentesimal(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const centesimalMinutes = Math.round((minutes / 60) * 100);
  return `${hours}:${String(centesimalMinutes).padStart(2, '0')}`;
}

/**
 * Convierte segundos totales a formato centesimal
 */
export function convertSecondsToCentesimal(seconds: number): string {
  const totalMinutes = Math.floor(seconds / 60);
  return convertMunitesToCentesimal(totalMinutes);
}

/**
 * Formatea segundos a formato legible HH:MM:SS
 */
export function formatSeconds(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Formatea minutos a formato legible HH:MM
 */
export function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

/**
 * Obtiene la fecha actual en formato ISO
 */
export function getCurrentISODate(): string {
  return new Date().toISOString();
}

/**
 * Formatea una fecha ISO a formato legible
 */
export function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
