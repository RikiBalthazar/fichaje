import React, { useMemo } from 'react';
import { TimeEntry, Project } from '../types';
import { convertSecondsToCentesimal } from '../utils/time';
import { Modal } from './ui';

interface DashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: TimeEntry[];
  projects: Project[];
}

export const DashboardModal: React.FC<DashboardModalProps> = ({
  isOpen,
  onClose,
  entries,
  projects,
}) => {
  const getProjectName = (projectId: string) => {
    return projects.find(p => p.id === projectId)?.name || 'Proyecto desconocido';
  };

  // Estadísticas de los últimos 7 días
  const weekStats = useMemo(() => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const weekEntries = entries.filter(entry => {
      const entryDate = new Date(entry.createdAt);
      return entryDate >= sevenDaysAgo && entryDate <= now;
    });

    // Agrupar por día
    const byDay: { [key: string]: TimeEntry[] } = {};
    weekEntries.forEach(entry => {
      const dateStr = new Date(entry.createdAt).toISOString().split('T')[0];
      if (!byDay[dateStr]) {
        byDay[dateStr] = [];
      }
      byDay[dateStr].push(entry);
    });

    // Calcular totales
    const days = Object.entries(byDay)
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([date, dayEntries]) => {
        const totalSeconds = dayEntries.reduce((sum, e) => sum + e.duration, 0);
        const totalMinutes = Math.floor(totalSeconds / 60);
        return {
          date,
          displayDate: new Date(date).toLocaleDateString('es-ES', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          }),
          totalMinutes,
          totalCentesimal: convertSecondsToCentesimal(totalSeconds),
          entries: dayEntries,
        };
      });

    const totalSeconds = weekEntries.reduce((sum, e) => sum + e.duration, 0);
    const totalMinutes = Math.floor(totalSeconds / 60);

    // Por proyecto
    const byProject: { [key: string]: number } = {};
    weekEntries.forEach(entry => {
      const name = getProjectName(entry.projectId);
      byProject[name] = (byProject[name] || 0) + entry.duration;
    });

    const projects = Object.entries(byProject)
      .map(([name, seconds]) => ({
        name,
        minutes: Math.floor(seconds / 60),
        centesimal: convertSecondsToCentesimal(seconds),
        percentage: ((seconds / totalSeconds) * 100).toFixed(1),
      }))
      .sort((a, b) => b.minutes - a.minutes);

    return {
      days,
      totalMinutes,
      totalCentesimal: convertSecondsToCentesimal(totalSeconds),
      projects,
      averagePerDay: (totalMinutes / 7).toFixed(0),
    };
  }, [entries, projects]);

  // Estadísticas de hoy
  const todayStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayEntries = entries.filter(
      entry => entry.createdAt.split('T')[0] === today
    );
    const totalSeconds = todayEntries.reduce((sum, e) => sum + e.duration, 0);
    return {
      totalMinutes: Math.floor(totalSeconds / 60),
      totalCentesimal: convertSecondsToCentesimal(totalSeconds),
      entryCount: todayEntries.length,
    };
  }, [entries]);

  return (
    <Modal isOpen={isOpen} title="📊 Dashboard - Últimos 7 Días" onClose={onClose} size="xl">
      <div className="space-y-6">
        {/* Resumen General */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-3xl font-bold text-blue-600">
              {weekStats.totalCentesimal}
            </div>
            <div className="text-xs text-blue-700 mt-1">
              Total Semana
            </div>
          </div>

          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-3xl font-bold text-green-600">
              {weekStats.averagePerDay}h
            </div>
            <div className="text-xs text-green-700 mt-1">
              Promedio/Día
            </div>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-3xl font-bold text-purple-600">
              {todayStats.totalCentesimal}
            </div>
            <div className="text-xs text-purple-700 mt-1">
              Hoy
            </div>
          </div>

          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="text-3xl font-bold text-orange-600">
              {weekStats.projects.length}
            </div>
            <div className="text-xs text-orange-700 mt-1">
              Proyectos
            </div>
          </div>
        </div>

        {/* Por Día */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">📅 Por Día</h3>
          <div className="space-y-2">
            {weekStats.days.map(day => (
              <div
                key={day.date}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div>
                  <div className="font-medium text-gray-900">{day.displayDate}</div>
                  <div className="text-xs text-gray-500">{day.entries.length} entrada(s)</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">{day.totalCentesimal}</div>
                  <div className="text-xs text-gray-600">
                    {day.totalMinutes}m
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Por Proyecto */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">🎯 Tiempo por Proyecto</h3>
          <div className="space-y-2">
            {weekStats.projects.map(project => (
              <div key={project.name} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-gray-900">{project.name}</div>
                  <div className="text-sm font-bold text-gray-900">
                    {project.centesimal}
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${project.percentage}%` }}
                  />
                </div>
                <div className="mt-1 flex justify-between text-xs text-gray-600">
                  <span>{project.minutes}m</span>
                  <span>{project.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Información Adicional */}
        <div className="p-4 bg-gray-100 rounded-lg text-sm text-gray-700">
          <p className="mb-2">
            <strong>Nota:</strong> Los datos mostrados corresponden a los últimos 7 días.
          </p>
          <p>
            El tiempo total se calcula en formato centesimal (ej: 1:50 = 1 hora y 50 minutos en base 100).
          </p>
        </div>
      </div>
    </Modal>
  );
};
