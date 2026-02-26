import React, { useState, useEffect } from 'react';

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface TagManagementProps {
  onTagsChange: () => void;
}

const COLOR_PRESETS = [
  { name: 'Azul', value: 'bg-blue-100 text-blue-800 border-blue-300' },
  { name: 'Verde', value: 'bg-green-100 text-green-800 border-green-300' },
  { name: 'Púrpura', value: 'bg-purple-100 text-purple-800 border-purple-300' },
  { name: 'Rojo', value: 'bg-red-100 text-red-800 border-red-300' },
  { name: 'Amarillo', value: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  { name: 'Rosa', value: 'bg-pink-100 text-pink-800 border-pink-300' },
  { name: 'Naranja', value: 'bg-orange-100 text-orange-800 border-orange-300' },
  { name: 'Índigo', value: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
  { name: 'Gris', value: 'bg-gray-100 text-gray-800 border-gray-300' },
  { name: 'Teal', value: 'bg-teal-100 text-teal-800 border-teal-300' },
  { name: 'Cyan', value: 'bg-cyan-100 text-cyan-800 border-cyan-300' },
  { name: 'Lime', value: 'bg-lime-100 text-lime-800 border-lime-300' },
];

export const TagManagement: React.FC<TagManagementProps> = ({ onTagsChange }) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(COLOR_PRESETS[0].value);
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      const response = await fetch('/api/tags', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setTags(data);
      }
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          name: newTagName.trim(),
          color: newTagColor
        })
      });

      if (response.ok) {
        setNewTagName('');
        setNewTagColor(COLOR_PRESETS[0].value);
        await loadTags();
        onTagsChange();
      }
    } catch (error) {
      console.error('Error creating tag:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (tag: Tag) => {
    setEditingId(tag.id);
    setEditName(tag.name);
    setEditColor(tag.color);
  };

  const handleSaveEdit = async (tagId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/tags/${tagId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          name: editName.trim(),
          color: editColor
        })
      });

      if (response.ok) {
        setEditingId(null);
        await loadTags();
        onTagsChange();
      }
    } catch (error) {
      console.error('Error updating tag:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (tagId: string) => {
    if (!confirm('¿Eliminar este tag? No afectará a los proyectos que ya lo usan.')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/tags/${tagId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        await loadTags();
        onTagsChange();
      }
    } catch (error) {
      console.error('Error deleting tag:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Crear nuevo tag */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-3">Crear nuevo tag</h3>
        <div className="flex gap-3 flex-wrap">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="Nombre del tag"
            className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => e.key === 'Enter' && !loading && handleCreateTag()}
          />
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowColorPicker(showColorPicker === 'new' ? null : 'new')}
              className={`px-4 py-2 rounded-lg border-2 font-medium ${newTagColor}`}
            >
              Color
            </button>
            {showColorPicker === 'new' && (
              <div className="absolute right-0 z-50 mt-2 bg-white border border-gray-300 rounded-lg shadow-xl p-3 max-h-[300px] overflow-y-auto">
                <div className="grid grid-cols-2 gap-2 w-48">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      type="button"
                      key={preset.name}
                      onClick={() => {
                        setNewTagColor(preset.value);
                        setShowColorPicker(null);
                      }}
                      className={`px-2 py-1.5 rounded text-xs font-medium border-2 ${preset.value} hover:scale-105 transition`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={handleCreateTag}
            disabled={loading || !newTagName.trim()}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Creando...' : 'Crear'}
          </button>
        </div>
      </div>

      {/* Lista de tags */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-3">Tags existentes</h3>
        {tags.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No hay tags personalizados. Crea uno arriba para empezar.
          </p>
        ) : (
          <div className="space-y-2">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md transition"
              >
                {editingId === tag.id ? (
                  <>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowColorPicker(showColorPicker === tag.id ? null : tag.id)}
                        className={`px-4 py-2 rounded-lg border-2 font-medium ${editColor}`}
                      >
                        Color
                      </button>
                      {showColorPicker === tag.id && (
                        <div className="absolute right-0 z-50 mt-2 bg-white border border-gray-300 rounded-lg shadow-xl p-3 max-h-[300px] overflow-y-auto">
                          <div className="grid grid-cols-2 gap-2 w-48">
                            {COLOR_PRESETS.map((preset) => (
                              <button
                                type="button"
                                key={preset.name}
                                onClick={() => {
                                  setEditColor(preset.value);
                                  setShowColorPicker(null);
                                }}
                                className={`px-2 py-1.5 rounded text-xs font-medium border-2 ${preset.value} hover:scale-105 transition`}
                              >
                                {preset.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(tag.id)}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold"
                    >
                      Guardar
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-semibold"
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    <span className={`px-4 py-2 rounded-full border-2 font-medium ${tag.color}`}>
                      {tag.name}
                    </span>
                    <div className="flex-1"></div>
                    <button
                      type="button"
                      onClick={() => handleStartEdit(tag)}
                      className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-semibold transition"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(tag.id)}
                      className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-semibold transition"
                    >
                      Eliminar
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          💡 <strong>Nota:</strong> Los tags que crees aquí aparecerán como sugerencias al crear o editar proyectos.
          Los proyectos existentes mantendrán sus tags aunque los elimines de aquí.
        </p>
      </div>
    </div>
  );
};
