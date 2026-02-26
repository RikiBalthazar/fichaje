import React, { useState } from 'react';
import { Project } from '../types';
import { Modal } from './ui';
import { TagInput } from './TagInput';

interface ProjectFormProps {
  isOpen: boolean;
  project?: Project;
  onClose: () => void;
  onSubmit: (name: string, description: string, tags: string[]) => Promise<void>;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({ isOpen, project, onClose, onSubmit }) => {
  const [name, setName] = useState(project?.name || '');
  const [description, setDescription] = useState(project?.description || '');
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description);
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
    }
    setError(null);
  }, [project, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('El nombre del proyecto es requerido');
      return;
    }

    try {
      setLoading(true);
      await onSubmit(name.trim(), description.trim(), tags);
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
            Tags
          </label>
          <TagInput
            tags={tags}
            onChange={setTags}
            placeholder="Agregar tags (ej: Backend, Frontend...)"
          />
          <p className="text-xs text-gray-500 mt-1">
            Presiona Enter para agregar. Sugerencias: Backend, Frontend, Reunión, Admin, QA, Diseño, Marketing, Soporte
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
