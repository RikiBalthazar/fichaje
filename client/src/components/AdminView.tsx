import React, { useState, useMemo } from 'react';
import { TimeEntry, Project } from '../types';
import { formatDate } from '../utils/time';
import { Modal } from './ui';
import { TagManagement } from './TagManagement';

interface AdminViewProps {
  isOpen: boolean;
  onClose: () => void;
  entries: TimeEntry[];
  projects: Project[];
  onEdit: (entry: TimeEntry) => void;
  onDelete: (entryId: string) => void;
  onProjectsChange?: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  isOpen,
  onClose,
  entries,
  projects,
  onEdit,
  onDelete,
  onProjectsChange,
}) => {
  const [activeTab, setActiveTab] = useState<'entries' | 'tags'>('entries');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<TimeEntry>>({});
  const [filterProjectId, setFilterProjectId] = useState<string>('');
  const [filterDateFrom, setFilterDateFrom] = useState<string>('');
  const [filterDateTo, setFilterDateTo] = useState<string>('');

  const handleStartEdit = (entry: TimeEntry) => {
    setEditingId(entry.id);
    setEditValues(entry);
  };

  const handleSaveEdit = (entry: TimeEntry) => {
    onEdit({...entry, ...editValues} as TimeEntry);
    setEditingId(null);
  };

  const getProjectName = (projectId: string) => {
    return projects.find(p => p.id === projectId)?.name || 'Proyecto desconocido';
  };

  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      // Filtrar por proyecto
      if (filterProjectId && entry.projectId !== filterProjectId) {
        return false;
      }

      // Filtrar por fecha
      const entryDate = new Date(entry.createdAt).toISOString().split('T')[0];
      if (filterDateFrom && entryDate < filterDateFrom) {
        return false;
      }
      if (filterDateTo && entryDate > filterDateTo) {
        return false;
      }

      return true;
    });
  }, [entries, filterProjectId, filterDateFrom, filterDateTo]);

  const sortedEntries = [...filteredEntries].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <Modal isOpen={isOpen} title="Configuración" onClose={onClose} size="xl">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('entries')}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'entries'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          📋 Registros
        </button>
        <button
          onClick={() => setActiveTab('tags')}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'tags'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          🏷️ Tags
        </button>
      </div>

      {/* Contenido según tab activa */}
      {activeTab === 'entries' ? (
        <>
      {/* Filtros */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="font-semibold text-gray-700 mb-3">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Proyecto</label>
            <select
              value={filterProjectId}
              onChange={(e) => setFilterProjectId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
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
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Hasta</label>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setFilterProjectId('');
                setFilterDateFrom('');
                setFilterDateTo('');
              }}
              className="w-full px-3 py-2 bg-gray-400 hover:bg-gray-500 text-white text-sm rounded transition"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Mostrando {sortedEntries.length} de {entries.length} registros
        </p>
      </div>

      <div className="overflow-x-auto overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 border-b-2 border-gray-300">
            <tr>
              <th className="px-4 py-2 text-left font-semibold">Proyecto</th>
              <th className="px-4 py-2 text-left font-semibold">Duración</th>
              <th className="px-4 py-2 text-left font-semibold">Centesimal</th>
              <th className="px-4 py-2 text-left font-semibold">Descripción</th>
              <th className="px-4 py-2 text-left font-semibold">Fecha</th>
              <th className="px-4 py-2 text-center font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sortedEntries.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No hay registros de tiempo
                </td>
              </tr>
            ) : (
              sortedEntries.map((entry) => (
                <tr key={entry.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {getProjectName(entry.projectId)}
                  </td>
                  <td className="px-4 py-3 font-mono">
                    {editingId === entry.id ? (
                      <input
                        type="number"
                        value={editValues.duration || entry.duration}
                        onChange={(e) =>
                          setEditValues({ ...editValues, duration: parseInt(e.target.value) || 0 })
                        }
                        className="w-16 px-2 py-1 border border-gray-300 rounded"
                      />
                    ) : (
                      `${Math.floor(entry.duration / 60)}m`
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-blue-600">
                    {entry.durationCentesimal}
                  </td>
                  <td className="px-4 py-3 max-w-xs truncate">
                    {editingId === entry.id ? (
                      <input
                        type="text"
                        value={editValues.description || ''}
                        onChange={(e) =>
                          setEditValues({ ...editValues, description: e.target.value })
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                      />
                    ) : (
                      entry.description || '-'
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    {formatDate(entry.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-center space-x-1">
                    {editingId === entry.id ? (
                      <>
                        <button
                          onClick={() => handleSaveEdit(entry)}
                          className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-2 py-1 bg-gray-400 text-white rounded text-xs hover:bg-gray-500"
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleStartEdit(entry)}
                          className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => onDelete(entry.id)}
                          className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                        >
                          Eliminar
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
        </>
      ) : (
        <TagManagement onTagsChange={() => onProjectsChange?.()} />
      )}

      <div className="mt-6 pt-4 border-t border-gray-200">
        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition"
        >
          Cerrar
        </button>
      </div>
    </Modal>
  );
};
