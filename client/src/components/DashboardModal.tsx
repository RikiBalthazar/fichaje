import React, { useMemo, useState } from 'react';
import { TimeEntry, Project } from '../types';
import { Modal } from './ui';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';

interface DashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: TimeEntry[];
  projects: Project[];
}

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#6366f1'];

export const DashboardModal: React.FC<DashboardModalProps> = ({
  isOpen,
  onClose,
  entries,
  projects,
}) => {
  const [timeRange, setTimeRange] = useState<7 | 30>(7);

  const getProjectName = (projectId: string) => {
    return projects.find(p => p.id === projectId)?.name || 'Desconocido';
  };

  const stats = useMemo(() => {
    const now = new Date();
    const rangeStart = new Date(now.getTime() - timeRange * 24 * 60 * 60 * 1000);

    // Entradas del período seleccionado
    const periodEntries = entries.filter(entry => {
      const entryDate = new Date(entry.createdAt);
      return entryDate >= rangeStart && entryDate <= now;
    });

    // Período anterior para comparativas
    const prevRangeStart = new Date(rangeStart.getTime() - timeRange * 24 * 60 * 60 * 1000);
    const prevPeriodEntries = entries.filter(entry => {
      const entryDate = new Date(entry.createdAt);
      return entryDate >= prevRangeStart && entryDate < rangeStart;
    });

    // Total de horas
    const totalSeconds = periodEntries.reduce((sum, e) => sum + e.duration, 0);
    const prevTotalSeconds = prevPeriodEntries.reduce((sum, e) => sum + e.duration, 0);
    const change = prevTotalSeconds > 0 
      ? ((totalSeconds - prevTotalSeconds) / prevTotalSeconds * 100).toFixed(1)
      : '0';

    // Por día (tendencia)
    const byDay: { [key: string]: number } = {};
    for (let i = 0; i < timeRange; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      byDay[dateStr] = 0;
    }

    periodEntries.forEach(entry => {
      const dateStr = new Date(entry.createdAt).toISOString().split('T')[0];
      if (byDay[dateStr] !== undefined) {
        byDay[dateStr] += entry.duration;
      }
    });

    const dailyData = Object.entries(byDay)
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([date, seconds]) => ({
        date: new Date(date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' }),
        horas: (seconds / 3600).toFixed(2),
        horasNum: seconds / 3600,
      }));

    // Por proyecto
    const byProject: { [key: string]: number } = {};
    periodEntries.forEach(entry => {
      const name = getProjectName(entry.projectId);
      byProject[name] = (byProject[name] || 0) + entry.duration;
    });

    const projectData = Object.entries(byProject)
      .map(([name, seconds]) => ({
        name: name.length > 20 ? name.substring(0, 20) + '...' : name,
        horas: (seconds / 3600).toFixed(1),
        horasNum: seconds / 3600,
        percentage: ((seconds / totalSeconds) * 100).toFixed(1),
      }))
      .sort((a, b) => b.horasNum - a.horasNum)
      .slice(0, 8); // Top 8 proyectos

    // Por día de la semana
    const byWeekday: { [key: string]: number } = {
      Lun: 0, Mar: 0, Mié: 0, Jue: 0, Vie: 0, Sáb: 0, Dom: 0
    };
    const weekdayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    periodEntries.forEach(entry => {
      const day = new Date(entry.createdAt).getDay();
      const dayName = weekdayNames[day];
      byWeekday[dayName] += entry.duration;
    });

    const weekdayData = Object.entries(byWeekday)
      .filter(([_, seconds]) => seconds > 0)
      .map(([day, seconds]) => ({
        day,
        horas: (seconds / 3600).toFixed(1),
        horasNum: seconds / 3600,
      }))
      .sort((a, b) => {
        const order = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
        return order.indexOf(a.day) - order.indexOf(b.day);
      });

    // Proyectos "muertos" (sin actividad en 30 días)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const deadProjects = projects.filter(p => {
      const lastUsed = p.lastUsedAt ? new Date(p.lastUsedAt) : null;
      return lastUsed && lastUsed < thirtyDaysAgo;
    }).slice(0, 5);

    return {
      totalHours: (totalSeconds / 3600).toFixed(1),
      prevTotalHours: (prevTotalSeconds / 3600).toFixed(1),
      change,
      avgPerDay: (totalSeconds / timeRange / 3600).toFixed(1),
      totalEntries: periodEntries.length,
      uniqueProjects: new Set(periodEntries.map(e => e.projectId)).size,
      dailyData,
      projectData,
      weekdayData,
      deadProjects,
    };
  }, [entries, projects, timeRange]);

  return (
    <Modal isOpen={isOpen} title="📊 Dashboard Analítico" onClose={onClose} size="xl">
      <div className="space-y-6">
        {/* Selector de período */}
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setTimeRange(7)}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              timeRange === 7
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Últimos 7 días
          </button>
          <button
            onClick={() => setTimeRange(30)}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              timeRange === 30
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Últimos 30 días
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalHours}h
            </div>
            <div className="text-xs text-blue-700 mt-1">Total Horas</div>
            <div className={`text-xs mt-1 font-semibold ${parseFloat(stats.change) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {parseFloat(stats.change) >= 0 ? '↑' : '↓'} {Math.abs(parseFloat(stats.change))}% vs anterior
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-600">
              {stats.avgPerDay}h
            </div>
            <div className="text-xs text-green-700 mt-1">Promedio/Día</div>
          </div>

          <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
            <div className="text-2xl font-bold text-purple-600">
              {stats.totalEntries}
            </div>
            <div className="text-xs text-purple-700 mt-1">Registros</div>
          </div>

          <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
            <div className="text-2xl font-bold text-orange-600">
              {stats.uniqueProjects}
            </div>
            <div className="text-xs text-orange-700 mt-1">Proyectos Activos</div>
          </div>
        </div>

        {/* Gráfico de tendencia (línea) */}
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">📈 Tendencia Diaria</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={stats.dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#666" />
              <YAxis tick={{ fontSize: 12 }} stroke="#666" label={{ value: 'Horas', angle: -90, position: 'insideLeft', fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px' }}
                formatter={(value: any) => [`${value}h`, 'Horas']}
              />
              <Line 
                type="monotone" 
                dataKey="horasNum" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de barras por proyecto */}
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">🎯 Top Proyectos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.projectData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis type="number" tick={{ fontSize: 12 }} stroke="#666" label={{ value: 'Horas', position: 'insideBottom', offset: -5, fontSize: 12 }} />
              <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 11 }} stroke="#666" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px' }}
                formatter={(value: any) => [`${value}h`, 'Horas']}
              />
              <Bar dataKey="horasNum" radius={[0, 8, 8, 0]}>
                {stats.projectData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Distribución por día de la semana */}
        {stats.weekdayData.length > 0 && (
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">📅 Distribución Semanal</h3>
            <div className="grid grid-cols-7 gap-2">
              {stats.weekdayData.map((day, index) => (
                <div key={day.day} className="text-center">
                  <div 
                    className={`h-24 flex items-end justify-center rounded-t-lg`}
                    style={{ 
                      backgroundColor: COLORS[index % COLORS.length],
                      opacity: 0.8,
                      height: `${Math.min((day.horasNum / Math.max(...stats.weekdayData.map(d => d.horasNum))) * 100, 100)}%`,
                      minHeight: '24px'
                    }}
                  >
                    <span className="text-white font-bold text-sm pb-1">{day.horas}h</span>
                  </div>
                  <div className="text-xs text-gray-600 mt-1 font-semibold">{day.day}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 text-xs text-gray-600 text-center">
              Día más productivo: <strong>{stats.weekdayData.reduce((max, d) => d.horasNum > max.horasNum ? d : max).day}</strong>
            </div>
          </div>
        )}

        {/* Proyectos sin actividad */}
        {stats.deadProjects.length > 0 && (
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <h3 className="font-semibold text-red-800 mb-2">⚠️ Proyectos Inactivos (30+ días)</h3>
            <div className="space-y-1">
              {stats.deadProjects.map(proj => (
                <div key={proj.id} className="text-sm text-red-700">
                  • {proj.name} 
                  <span className="text-xs text-red-600 ml-2">
                    (última actividad: {proj.lastUsedAt ? new Date(proj.lastUsedAt).toLocaleDateString('es-ES') : 'nunca'})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
