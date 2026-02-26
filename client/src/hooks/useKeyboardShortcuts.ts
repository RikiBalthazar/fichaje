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
      console.log('⌨️ Tecla presionada:', {
        code: event.code,
        key: event.key,
        altKey: event.altKey,
        shiftKey: event.shiftKey,
        ctrlKey: event.ctrlKey,
        isAnyModalOpen,
        activeElement: document.activeElement?.tagName
      });

      // No ejecutar atajos si hay modal abierto
      if (isAnyModalOpen) {
        console.log('⚠️ Modal abierto, atajos deshabilitados');
        return;
      }

      // Alt + 1-9: Iniciar proyecto rápido
      if (event.altKey && event.code >= 'Digit1' && event.code <= 'Digit9') {
        event.preventDefault();
        const index = parseInt(event.code.replace('Digit', '')) - 1;
        console.log(`✅ Alt + ${index + 1} detectado. ProjectIds:[${projectIds.length}], Index:${index}, Has project: ${!!projectIds[index]}`);
        if (projectIds[index]) {
          onPlay(projectIds[index]);
          console.log(`🎮 Atajo: Iniciando proyecto ${index + 1} (ID: ${projectIds[index]})`);
        } else {
          console.warn(`❌ No hay proyecto en índice ${index}`);
        }
        return;
      }

      // Espacio: Play/Pause del proyecto activo
      if (event.code === 'Space') {
        const isInput = document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA';
        console.log(`Space detectado. isInput: ${isInput}`);
        if (!isInput) {
          event.preventDefault();
          onPause();
          console.log('🎮 Atajo: Play/Pause (Space)');
          return;
        } else {
          console.log('⏭️ Space ignorado (usuario escribiendo)');
        }
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
        event.preventDefault();
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
    console.log('🚀 useKeyboardShortcuts montado. ProjectIds:', projectIds.length, 'isAnyModalOpen:', isAnyModalOpen);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      console.log('🛑 useKeyboardShortcuts desmontado');
      window.removeEventListener('keydown', handleKeyDown);
    };
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
