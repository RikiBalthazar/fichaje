import React, { useState, useEffect } from 'react';
import { DescriptionTemplate } from '../types';
import { templatesAPI } from '../services/api';
import { Modal } from './ui';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [templates, setTemplates] = useState<DescriptionTemplate[]>([]);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDesc, setNewTemplateDesc] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen]);

  const loadTemplates = async () => {
    try {
      const data = await templatesAPI.getAll();
      setTemplates(data);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const handleAddTemplate = async () => {
    if (!newTemplateName.trim() || !newTemplateDesc.trim()) return;

    try {
      const template = await templatesAPI.create(newTemplateName, newTemplateDesc);
      setTemplates([...templates, template]);
      setNewTemplateName('');
      setNewTemplateDesc('');
    } catch (error) {
      console.error('Error creating template:', error);
    }
  };

  const handleStartEdit = (template: DescriptionTemplate) => {
    setEditingId(template.id);
    setEditName(template.name);
    setEditDesc(template.description);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editName.trim() || !editDesc.trim()) return;

    try {
      const updated = await templatesAPI.update(editingId, editName, editDesc);
      setTemplates(
        templates.map(t => (t.id === editingId ? updated : t))
      );
      setEditingId(null);
      setEditName('');
      setEditDesc('');
    } catch (error) {
      console.error('Error updating template:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar esta plantilla?')) return;

    try {
      await templatesAPI.delete(id);
      setTemplates(templates.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} title="⚙️ Configuración - Plantillas de Descripción" onClose={onClose} size="lg">
      <div className="space-y-6">
        {/* Agregar nueva plantilla */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-3">➕ Nueva Plantilla</h3>
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Nombre (ej: Reunión)"
              value={newTemplateName}
              onChange={(e) => setNewTemplateName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            />
            <textarea
              placeholder="Descripción (ej: Reunión con cliente)"
              value={newTemplateDesc}
              onChange={(e) => setNewTemplateDesc(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            />
            <button
              onClick={handleAddTemplate}
              disabled={!newTemplateName.trim() || !newTemplateDesc.trim()}
              className="w-full px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-semibold transition disabled:bg-blue-300"
            >
              Agregar
            </button>
          </div>
        </div>

        {/* Lista de plantillas */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">
            📋 Plantillas Guardadas ({templates.length})
          </h3>
          {templates.length === 0 ? (
            <div className="text-sm text-gray-500 text-center py-4">
              No hay plantillas aún. Crea una arriba.
            </div>
          ) : (
            <div className="space-y-2">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="p-3 border border-gray-200 rounded-lg bg-gray-50"
                >
                  {editingId === template.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                      <textarea
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        rows={2}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveEdit}
                          className="flex-1 px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs font-semibold transition"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="flex-1 px-2 py-1 bg-gray-400 hover:bg-gray-500 text-white rounded text-xs font-semibold transition"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="font-semibold text-gray-900">{template.name}</div>
                      <div className="text-sm text-gray-600 mt-1">{template.description}</div>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleStartEdit(template)}
                          className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-semibold transition"
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => handleDelete(template.id)}
                          className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-semibold transition"
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
