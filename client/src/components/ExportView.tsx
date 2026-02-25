import React, { useState } from 'react';
import { Project, TimeEntry } from '../types';
import { Modal } from './ui';
import { exportAPI } from '../services/api';

interface ExportViewProps {
  isOpen: boolean;
  onClose: () => void;
  entries: TimeEntry[];
  projects: Project[];
  onExportSuccess: () => void;
  onExportError: (error: string) => void;
}

export const ExportView: React.FC<ExportViewProps> = ({
  isOpen,
  onClose,
  entries,
  projects,
  onExportSuccess,
  onExportError,
}) => {
  const [filterProjectId, setFilterProjectId] = useState<string>('');
  const [filterDateFrom, setFilterDateFrom] = useState<string>('');
  const [filterDateTo, setFilterDateTo] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const content = await exportAPI.generateTxt({
        projectId: filterProjectId || undefined,
        dateFrom: filterDateFrom || undefined,
        dateTo: filterDateTo || undefined,
      });

      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename with filters applied
      const dateStr = new Date().toISOString().split('T')[0];
      const projectName = filterProjectId 
        ? projects.find(p => p.id === filterProjectId)?.name?.replace(/\s+/g, '-') || 'proyecto'
        : 'todos';
      link.download = `fichaje-${dateStr}-${projectName}.txt`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      onExportSuccess();
      handleClose();
    } catch (error) {
      console.error('Error exporting:', error);
      onExportError('Error al exportar');
    } finally {
      setIsExporting(false);
    }
  };

  const handleClose = () => {
    setFilterProjectId('');
    setFilterDateFrom('');
    setFilterDateTo('');
    onClose();
  };

  const countFilteredEntries = () => {
    let count = entries.length;
    if (filterProjectId) {
      count = entries.filter(e => e.projectId === filterProjectId).length;
    }
    if (filterDateFrom || filterDateTo) {
      count = entries.filter(entry => {
        const entryDate = new Date(entry.createdAt).toISOString().split('T')[0];
        if (filterDateFrom && entryDate < filterDateFrom) return false;
        if (filterDateTo && entryDate > filterDateTo) return false;
        if (filterProjectId && entry.projectId !== filterProjectId) return false;
        return true;
      }).length;
    }
    return count;
  };

  return (
    <Modal isOpen={isOpen} title="Exportar a TXT" onClose={handleClose} size="lg">
      <div className="space-y-4">
        {/* Filtros */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-700 mb-3">Opciones de exportación</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Proyecto</label>
              <select
                value={filterProjectId}
                onChange={(e) => setFilterProjectId(e.target.value)}
                disabled={isExporting}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm disabled:bg-gray-200"
              >
                <option value="">Todos los proyectos</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Desde</label>
              <input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                disabled={isExporting}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm disabled:bg-gray-200"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Hasta</label>
              <input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                disabled={isExporting}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm disabled:bg-gray-200"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Se exportarán {countFilteredEntries()} registros
          </p>
        </div>

        {/* Resumen */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">Resumen de exportación</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li><span className="font-medium">Proyecto:</span> {filterProjectId ? projects.find(p => p.id === filterProjectId)?.name : 'Todos'}</li>
            <li><span className="font-medium">Período:</span> {filterDateFrom ? filterDateFrom : 'Inicio'} a {filterDateTo ? filterDateTo : 'Fin'}</li>
            <li><span className="font-medium">Registros:</span> {countFilteredEntries()} de {entries.length}</li>
          </ul>
        </div>

        {/* Botones */}
        <div className="flex gap-2 pt-4 border-t border-gray-200">
          <button
            onClick={() => {
              setFilterProjectId('');
              setFilterDateFrom('');
              setFilterDateTo('');
            }}
            disabled={isExporting}
            className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg transition disabled:bg-gray-300"
          >
            Limpiar filtros
          </button>
          <div className="flex-1" />
          <button
            onClick={handleClose}
            disabled={isExporting}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition disabled:bg-gray-200"
          >
            Cancelar
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting || countFilteredEntries() === 0}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition disabled:bg-blue-300 flex items-center gap-2"
          >
            {isExporting ? '⏳ Exportando...' : '📥 Exportar'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
