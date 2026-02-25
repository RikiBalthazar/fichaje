/**
 * Convierte minutos a formato centesimal (0-100)
 * @param minutes Minutos totales
 * @returns Formato centesimal como string "H:MM"
 */
export function convertMinutesToCentesimal(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  const centesimalMinutes = Math.round((remainingMinutes / 60) * 100);
  return `${hours}:${String(centesimalMinutes).padStart(2, '0')}`;
}

/**
 * Convierte segundos a formato centesimal
 */
export function convertSecondsToCentesimal(seconds: number): string {
  const totalMinutes = Math.floor(seconds / 60);
  return convertMinutesToCentesimal(totalMinutes);
}

/**
 * Calcula el total de minutos de un proyecto
 */
export function calculateTotalMinutes(entries: any[]): number {
  return entries.reduce((sum, entry) => sum + Math.floor(entry.duration / 60), 0);
}

/**
 * Formatea una fecha ISO para que sea legible
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

/**
 * Genera el contenido de texto para exportar
 */
export function generateExportContent(entries: any[], projects: any[]): string {
  const projectMap = new Map(projects.map((p: any) => [p.id, p]));
  
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  let content = '';
  content += '═══════════════════════════════════════════════════════════\n';
  content += `REPORTE DE HORAS - ${new Date().toLocaleDateString('es-ES')}\n`;
  content += '═══════════════════════════════════════════════════════════\n\n';

  sortedEntries.forEach((entry, index) => {
    const project = projectMap.get(entry.project_id);
    const projectName = project?.name || 'Proyecto desconocido';

    content += `${index + 1}. Proyecto: ${projectName}\n`;
    content += `   Descripción: ${entry.description || '(sin descripción)'}\n`;
    content += `   Horas: ${entry.duration_centesimal} (centesimal)\n`;
    content += `   Fecha: ${formatDate(entry.created_at)}\n`;
    content += '\n';
  });

  // Total
  const totalMinutes = sortedEntries.reduce((sum: number, e: any) => sum + Math.floor(e.duration / 60), 0);
  content += '───────────────────────────────────────────────────────────\n';
  content += `TOTAL: ${convertMinutesToCentesimal(totalMinutes)} horas (centesimal)\n`;
  content += '═══════════════════════════════════════════════════════════\n';

  return content;
}
