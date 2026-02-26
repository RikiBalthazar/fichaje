import { useState, KeyboardEvent, useEffect } from 'react';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

const TAG_COLORS: { [key: string]: string } = {
  'Backend': 'bg-blue-100 text-blue-800 border-blue-300',
  'Frontend': 'bg-green-100 text-green-800 border-green-300',
  'Reunión': 'bg-purple-100 text-purple-800 border-purple-300',
  'Admin': 'bg-red-100 text-red-800 border-red-300',
  'QA': 'bg-yellow-100 text-yellow-800 border-yellow-300',
  'Diseño': 'bg-pink-100 text-pink-800 border-pink-300',
  'Marketing': 'bg-orange-100 text-orange-800 border-orange-300',
  'Soporte': 'bg-indigo-100 text-indigo-800 border-indigo-300',
};

const DEFAULT_COLOR = 'bg-gray-100 text-gray-800 border-gray-300';

export const TagInput: React.FC<TagInputProps> = ({
  tags,
  onChange,
  placeholder = 'Agregar tag...'
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [userTags, setUserTags] = useState<Array<{name: string; color: string}>>([]);

  // Cargar tags del usuario desde la API
  useEffect(() => {
    const loadUserTags = async () => {
      try {
        const response = await fetch('/api/tags', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setUserTags(data);
        }
      } catch (error) {
        console.error('Error loading user tags:', error);
      }
    };
    loadUserTags();
  }, []);

  const getTagColor = (tag: string) => {
    // Primero buscar en tags del usuario
    const userTag = userTags.find(t => t.name === tag);
    if (userTag) return userTag.color;
    
    // Si no, usar el color predefinido
    return TAG_COLORS[tag] || DEFAULT_COLOR;
  };

  // Combinar tags predefinidos con tags del usuario
  const allSuggestions = [
    ...Object.keys(TAG_COLORS),
    ...userTags.map(t => t.name).filter(name => !TAG_COLORS[name])
  ];

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInputValue('');
    setShowSuggestions(false);
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(t => t !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const filteredSuggestions = allSuggestions.filter(
    s => !tags.includes(s) && s.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <div className="relative">
      {/* Tags Display */}
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getTagColor(tag)}`}
          >
            {tag}
            <button
              onClick={() => removeTag(tag)}
              className="hover:opacity-70 transition-opacity ml-1"
              type="button"
            >
              ✕
            </button>
          </span>
        ))}
      </div>

      {/* Input */}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Suggestions Dropdown */}
      {showSuggestions && (filteredSuggestions.length > 0 || inputValue.trim()) && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => addTag(suggestion)}
              type="button"
              className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors border-l-4 ${getTagColor(suggestion).split(' ')[2]}`}
            >
              <span className={`inline-block px-2 py-1 rounded text-sm ${getTagColor(suggestion)}`}>
                {suggestion}
              </span>
            </button>
          ))}
          
          {/* Create new tag option */}
          {inputValue.trim() && !tags.includes(inputValue.trim()) && (
            <button
              onClick={() => addTag(inputValue)}
              type="button"
              className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors border-t border-gray-200"
            >
              <div className="flex items-center gap-2">
                <span className="text-blue-600 font-semibold">+</span>
                <span className="text-gray-600">Crear tag:</span>
                <span className={`inline-block px-2 py-1 rounded text-sm ${DEFAULT_COLOR}`}>
                  {inputValue.trim()}
                </span>
              </div>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export { TAG_COLORS, DEFAULT_COLOR };
