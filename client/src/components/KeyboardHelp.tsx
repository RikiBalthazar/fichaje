import React from 'react';
import { Modal } from './ui';
import { KEYBOARD_SHORTCUTS } from '../hooks/useKeyboardShortcuts';

interface KeyboardHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardHelp: React.FC<KeyboardHelpProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} title="⌨️ Atajos de Teclado" onClose={onClose} size="md">
      <div className="space-y-4">
        <p className="text-gray-600 text-sm mb-6">
          Estos atajos te ayudarán a trabajar más rápido sin usar el ratón:
        </p>

        <div className="space-y-3">
          {KEYBOARD_SHORTCUTS.map((shortcut, idx) => (
            <div key={idx} className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
              <div className="bg-blue-100 text-blue-700 px-3 py-2 rounded font-mono text-sm font-bold whitespace-nowrap">
                {shortcut.shortcut}
              </div>
              <p className="text-gray-700 text-sm pt-2 flex-1">
                {shortcut.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>💡 Tip:</strong> Los atajos no funcionan mientras haya un modal abierto. Ciérralo primero con <kbd className="bg-white px-2 py-1 rounded border">Esc</kbd>
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default KeyboardHelp;
