import { useEffect, useCallback } from 'react';

interface UseKeyboardShortcutsProps {
  onPlay: (projectId: string) => void;
  onPause: () => void;
  onStop: () => void;
  onVoiceRecord: () => void;
  onToggleHelp?: () => void;
  projectIds: string[];
  isAnyModalOpen: boolean;
}

export const useKeyboardShortcuts = ({
  onPlay,
  onPause,
  onStop,
  onVoiceRecord,
  onToggleHelp,
  projectIds,
  isAnyModalOpen
}: UseKeyboardShortcutsProps) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // No ejecutar atajos si hay modal abierto
      if (isAnyModalOpen) return;

      // Alt + 1-9: Iniciar proyecto rápido
      if (event.altKey && event.code >= 'Digit1' && event.code <= 'Digit9') {
        event.preventDefault();
        const index = parseInt(event.code.replace('Digit', '')) - 1;
        if (projectIds[index]) {
          onPlay(projectIds[index]);
          console.log(`🎮 Atajo: Iniciando proyecto ${index + 1}`);
        }
        return;
      }

      // Espacio: Play/Pause del proyecto activo
      if (event.code === 'Space' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        event.preventDefault();
        onPause(); // Si hay uno activo lo pausa, si no, se ignora
        console.log('🎮 Atajo: Play/Pause');
        return;
      }

      // Alt + V: Grabar descripción
      if (event.altKey && event.code === 'KeyV') {
        event.preventDefault();
        onVoiceRecord();
        console.log('🎮 Atajo: Grabar descripción (Alt+V)');
        return;
      }

      // Esc: Detener timer activo
      if (event.code === 'Escape') {
        onStop();
        console.log('🎮 Atajo: Detener timer (Esc)');
        return;
      }

      // ?: Mostrar ayuda de atajos
      if ((event.key === '?' || (event.shiftKey && event.code === 'Slash')) && onToggleHelp) {
        event.preventDefault();
        onToggleHelp();
        console.log('🎮 Atajo: Mostrar ayuda (?)');
        return;
      }
    },
    [onPlay, onPause, onStop, onVoiceRecord, onToggleHelp, projectIds, isAnyModalOpen]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};

// Ayuda de atajos para mostrar en la app
export const KEYBOARD_SHORTCUTS = [
  { shortcut: 'Alt + 1-9', description: 'Iniciar proyecto rápido (Proyecto 1-9)' },
  { shortcut: 'Espacio', description: 'Play/Pause del proyecto activo' },
  { shortcut: 'Alt + V', description: 'Grabar descripción sin abrir modal' },
  { shortcut: 'Esc', description: 'Detener timer activo' },
  { shortcut: '?', description: 'Mostrar esta ayuda' }
];
