import { useState, KeyboardEvent } from 'react';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
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
  suggestions = Object.keys(TAG_COLORS),
  placeholder = 'Agregar tag...'
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const getTagColor = (tag: string) => {
    return TAG_COLORS[tag] || DEFAULT_COLOR;
  };

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

  const filteredSuggestions = suggestions.filter(
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
      {showSuggestions && filteredSuggestions.length > 0 && (
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
        </div>
      )}
    </div>
  );
};

export { TAG_COLORS, DEFAULT_COLOR };
