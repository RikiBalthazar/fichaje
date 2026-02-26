import React, { useState } from 'react';
import { Project } from '../types';
import { Modal } from './ui';
import { TagInput } from './TagInput';

interface ProjectFormProps {
  isOpen: boolean;
  project?: Project;
  onClose: () => void;
  onSubmit: (
    name: string,
    description: string,
    tags: string[],
    targetMinutes: number | null
  ) => Promise<void>;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({ isOpen, project, onClose, onSubmit }) => {
  const [name, setName] = useState(project?.name || '');
  const [description, setDescription] = useState(project?.description || '');
  const [tags, setTags] = useState<string[]>([]);
  const [targetHours, setTargetHours] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description);
      if (project.targetMinutes && project.targetMinutes > 0) {
        setTargetHours((project.targetMinutes / 60).toString());
      } else {
        setTargetHours('');
      }
      try {
        const parsedTags = JSON.parse(project.tags || '[]');
        setTags(Array.isArray(parsedTags) ? parsedTags : []);
      } catch (e) {
        setTags([]);
      }
    } else {
      setName('');
      setDescription('');
      setTags([]);
      setTargetHours('');
    }
    setError(null);
  }, [project, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('El nombre del proyecto es requerido');
      return;
    }

    const targetValue = targetHours.trim();
    let targetMinutes: number | null = null;
    if (targetValue) {
      const parsed = Number(targetValue);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        setError('El tiempo limite debe ser un numero mayor que 0');
        return;
      }
      targetMinutes = Math.round(parsed * 60);
    }

    try {
      setLoading(true);
      await onSubmit(name.trim(), description.trim(), tags, targetMinutes);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar proyecto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      title={project ? 'Editar proyecto' : 'Crear nuevo proyecto'} 
      onClose={onClose}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del proyecto *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Desarrollo web"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe el proyecto (opcional)"
            className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tiempo limite (horas)
          </label>
          <input
            type="number"
            min="0"
            step="0.25"
            value={targetHours}
            onChange={(e) => setTargetHours(e.target.value)}
            placeholder="Ej: 40"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">
            Se mostrara una alerta visual al 80% y al superar el limite.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tags
          </label>
          <TagInput
            tags={tags}
            onChange={setTags}
            placeholder="Escribe y presiona Enter para crear un tag..."
          />
          <p className="text-xs text-gray-500 mt-1">
            💡 Puedes crear tags personalizados o usar las sugerencias. Presiona Enter para agregar.
          </p>
        </div>

        <div className="flex gap-2 justify-end pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Guardando...' : project ? 'Actualizar' : 'Crear'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
