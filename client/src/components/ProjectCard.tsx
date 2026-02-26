import { useState, useEffect, memo } from 'react';
import { Project, DescriptionTemplate } from '../types';
import { formatSeconds, formatSecondsHHMM, convertSecondsToCentesimal } from '../utils/time';
import { useSpeechRecognition } from '../hooks';
import { templatesAPI } from '../services/api';
import { Modal } from './ui';

interface ProjectCardProps {
  project: Project;
  isActive: boolean;
  isPaused: boolean;
  elapsedSeconds: number;
  pausedElapsedSeconds: number;
  onPlay: (projectId: string) => void;
  onPause: () => void;
  onStop: () => void;
  onStopPaused: (projectId: string) => void;
  onSaveDescriptionDraft: (projectId: string, description: string) => void;
  onToggleFavorite?: (projectId: string) => void;
  currentDescriptionDraft: string;
  isDragged?: boolean;
  isDragOver?: boolean;
  onDragStart?: (e: React.DragEvent, projectId: string) => void;
  onDragOver?: (e: React.DragEvent, projectId: string) => void;
  onDragLeave?: () => void;
  onDrop?: (e: React.DragEvent, projectId: string) => void;
  forceOpenDescriptionModal?: boolean;
  onDescriptionModalClose?: () => void;
  todayMinutes?: number; // Minutos trabajados hoy en este proyecto
}

const ProjectCardComponent: React.FC<ProjectCardProps> = ({
  project,
  isActive,
  isPaused,
  elapsedSeconds,
  pausedElapsedSeconds,
  onPlay,
  onPause,
  onStop,
  onStopPaused,
  onSaveDescriptionDraft,
  onToggleFavorite,
  currentDescriptionDraft,
  isDragged = false,
  isDragOver = false,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  forceOpenDescriptionModal = false,
  onDescriptionModalClose,
  todayMinutes = 0,
}) => {
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [templates, setTemplates] = useState<DescriptionTemplate[]>([]);
  const { isListening, transcript, error, permissionStatus, startListening, stopListening, setTranscript, requestPermission } =
    useSpeechRecognition();

  useEffect(() => {
    if (showDescriptionModal) {
      loadTemplates();
    }
  }, [showDescriptionModal]);

  // Abrir modal desde keyboard shortcut (Alt+V)
  useEffect(() => {
    if (forceOpenDescriptionModal && (isActive || isPaused)) {
      console.log('⌨️ Abriendo modal de descripción por atajo de teclado');
      setShowDescriptionModal(true);
      setTranscript(currentDescriptionDraft || '');
      if (onDescriptionModalClose) {
        // Resetear el estado en el padre después de abrirlo
        setTimeout(() => onDescriptionModalClose(), 100);
      }
    }
  }, [forceOpenDescriptionModal, isActive, isPaused, currentDescriptionDraft, setTranscript, onDescriptionModalClose]);

  const loadTemplates = async () => {
    try {
      const data = await templatesAPI.getAll();
      setTemplates(data);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const totalMinutes = project.totalMinutes + Math.floor(isActive ? elapsedSeconds / 60 : 0);
  const totalCentesimal = convertSecondsToCentesimal(totalMinutes * 60);
  const targetMinutes = project.targetMinutes ?? null;
  const isOverLimit = !!(targetMinutes && totalMinutes >= targetMinutes);
  const isNearLimit = !!(targetMinutes && !isOverLimit && totalMinutes >= targetMinutes * 0.8);

  // Check Web Speech API support
  const speechSupported = typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  // Detect Opera browser (known issues with Web Speech API)
  const isOpera = typeof window !== 'undefined' && 
    ((navigator.userAgent.indexOf('OPR') !== -1) || (navigator.userAgent.indexOf('Opera') !== -1));

  // Debug: Log cuando cambia el estado
  useEffect(() => {
    console.log('📱 ProjectCard - isListening:', isListening, 'transcript:', transcript);
  }, [isListening, transcript]);

  const handleDescriptionModal = () => {
    if (!isActive && !isPaused) return;
    console.log('📱 Abriendo modal de descripción');
    setShowDescriptionModal(true);
    setTranscript(currentDescriptionDraft || '');
  };

  const handleToggleRecording = async () => {
    console.log('🎤 Toggle recording - Current state:', { isListening, permissionStatus });
    
    if (isListening) {
      console.log('⏹️ Deteniendo grabación...');
      stopListening();
    } else {
      // Verificar permisos antes de iniciar
      if (permissionStatus !== 'granted') {
        console.log('⚠️ Permisos no concedidos, solicitando...');
        const granted = await requestPermission();
        if (!granted) {
          console.error('❌ No se pudieron obtener permisos');
          return;
        }
      }
      
      console.log('🎤 Iniciando grabación...');
      startListening();
    }
  };

  const handleSaveDescription = async () => {
    console.log('💾 [ProjectCard] handleSaveDescription called, transcript:', transcript);
    
    // Detener grabación si está activa
    if (isListening) {
      console.log('⏹️ Deteniendo grabación antes de guardar');
      stopListening();
    }

    // Guardar el draft en App.tsx (incluso si está vacío)
    if (transcript.trim()) {
      console.log('💾 Guardando descripción draft:', transcript);
      onSaveDescriptionDraft(project.id, transcript);
    } else {
      console.warn('⚠️ Guardando descripción vacía');
      onSaveDescriptionDraft(project.id, '');
    }

    // Cerrar modal
    console.log('🚪 Cerrando modal...');
    setShowDescriptionModal(false);
    if (onDescriptionModalClose) {
      onDescriptionModalClose();
    }
  };

  const handleClearDescription = () => {
    if (isListening) {
      stopListening();
    }
    setTranscript('');
    onSaveDescriptionDraft(project.id, '');
  };

  // Limpiar si el modal se cierra
  const handleCloseModal = () => {
    console.log('❌ Cerrando modal');
    if (isListening) {
      console.log('⏹️ Parando grabación...');
      stopListening();
    }
    setShowDescriptionModal(false);
    if (onDescriptionModalClose) {
      onDescriptionModalClose();
    }
  };

  return (
    <>
      <div
        draggable
        onDragStart={(e) => onDragStart?.(e, project.id)}
        onDragOver={(e) => onDragOver?.(e, project.id)}
        onDragLeave={onDragLeave}
        onDrop={(e) => onDrop?.(e, project.id)}
        className={`rounded-lg shadow-lg transition-all p-3 h-full flex flex-col cursor-move ${
          isDragged ? 'opacity-50 bg-gray-100' : ''
        } ${
          isDragOver ? 'ring-2 ring-green-500 border-2 border-green-500' : ''
        } ${
          isActive
            ? 'ring-2 ring-blue-500 bg-blue-50'
            : 'bg-white hover:shadow-xl'
        } ${
          isOverLimit
            ? 'border-2 border-red-300'
            : isNearLimit
              ? 'border-2 border-yellow-300'
              : ''
        }`}
      >
        {/* Header */}
        <div className="mb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-gray-800">{project.name}</h3>
                {/* Favorite Star */}
                {onToggleFavorite && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(project.id);
                    }}
                    className="text-lg hover:scale-110 transition-transform"
                    title={project.isFavorite ? 'Quitar de favoritos' : 'Marcar como favorito'}
                  >
                    {project.isFavorite ? '⭐' : '☆'}
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-600 mt-0.5">{project.description}</p>
              {targetMinutes && (
                <div
                  className={`mt-1 text-xs font-semibold ${
                    isOverLimit
                      ? 'text-red-600'
                      : isNearLimit
                        ? 'text-yellow-700'
                        : 'text-gray-500'
                  }`}
                >
                  {isOverLimit
                    ? '⛔ Limite superado'
                    : isNearLimit
                      ? '⚠️ Cerca del limite'
                      : '🎯 Limite'}{' '}
                  {formatSecondsHHMM(targetMinutes * 60)}
                </div>
              )}
            </div>
            {/* Today's Hours Badge */}
            {todayMinutes > 0 && (
              <div className="flex flex-col items-end gap-1">
                <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
                  🕐 {formatSecondsHHMM(todayMinutes * 60)} hoy
                </span>
                {/* Used Today Indicator */}
                {project.lastUsedAt && new Date(project.lastUsedAt).toDateString() === new Date().toDateString() && (
                  <span className="text-xs font-semibold text-blue-600">● Activo hoy</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Time Display - Lado a lado con sesión activa/pausada */}
        <div className="mb-2 flex gap-2">
          {/* Tiempo acumulado */}
          <div className="flex-1 p-2 bg-gray-100 rounded">
            <div className="text-xs text-gray-600 mb-0.5">Tiempo acumulado</div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-mono font-bold text-gray-800">
                {formatSecondsHHMM(totalMinutes * 60)}
              </span>
              <span className="text-xs text-blue-600">
                ({totalCentesimal}h)
              </span>
            </div>
          </div>

          {/* Sesión activa */}
          {isActive && (
            <div className="flex-1 p-2 bg-green-50 border border-green-200 rounded">
              <div className="text-xs text-green-600 font-semibold mb-0.5">SESIÓN ACTIVA</div>
              <div className="text-sm font-mono font-bold text-green-700">
                {formatSeconds(elapsedSeconds)}
              </div>
            </div>
          )}

          {/* Sesión pausada */}
          {isPaused && (
            <div className="flex-1 p-2 bg-yellow-50 border border-yellow-200 rounded">
              <div className="text-xs text-yellow-700 font-semibold mb-0.5">SESIÓN EN PAUSA</div>
              <div className="text-sm font-mono font-bold text-yellow-800">
                {formatSeconds(pausedElapsedSeconds)}
              </div>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-1.5 mt-auto">
          {isActive ? (
            <>
              <div className="flex gap-1.5">
                <button
                  onClick={onPause}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-1.5 px-2 rounded transition flex items-center justify-center gap-1.5 text-sm"
                >
                  <span>⏸</span> Pausa
                </button>
                <button
                  onClick={onStop}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-1.5 px-2 rounded transition flex items-center justify-center gap-1.5 text-sm"
                >
                  <span>⏹</span> Detener
                </button>
              </div>
              <button
                onClick={handleDescriptionModal}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1.5 px-2 rounded transition flex items-center justify-center gap-1.5 text-sm"
              >
                <span>🎤</span> Descripción
              </button>
            </>
          ) : isPaused ? (
            <>
              <div className="flex gap-1.5">
                <button
                  onClick={() => onPlay(project.id)}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-1.5 px-2 rounded transition flex items-center justify-center gap-1.5 text-sm"
                >
                  <span>▶</span> Reanudar
                </button>
                <button
                  onClick={() => onStopPaused(project.id)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-1.5 px-2 rounded transition flex items-center justify-center gap-1.5 text-sm"
                >
                  <span>⏹</span> Detener
                </button>
              </div>
              <button
                onClick={handleDescriptionModal}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1.5 px-2 rounded transition flex items-center justify-center gap-1.5 text-sm"
              >
                <span>🎤</span> Descripción
              </button>
            </>
          ) : (
            <button
              onClick={() => onPlay(project.id)}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-1.5 px-2 rounded transition flex items-center justify-center gap-1.5 text-sm"
            >
              <span className="text-base">▶</span> Iniciar
            </button>
          )}
        </div>
      </div>

      {/* Description Modal */}
      <Modal isOpen={showDescriptionModal} title="Descripción de trabajo" onClose={handleCloseModal} size="lg">
        <div className="space-y-4">
          {/* Web Speech API Support Check */}
          {!speechSupported && (
            <div className="p-3 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
              ❌ <strong>Web Speech API no soportado</strong> en este navegador. Usa Chrome, Edge o Safari.
            </div>
          )}

          {speechSupported && (
            <div className="p-2 bg-green-50 border border-green-200 rounded text-green-700 text-xs">
              ✅ Web Speech API soportado - Listo para usar micrófono
            </div>
          )}

          {/* Warning para Opera */}
          {isOpera && (
            <div className="p-3 bg-yellow-100 border border-yellow-300 rounded text-sm">
              <div className="text-yellow-800 font-bold mb-1">
                ⚠️ Navegador Opera detectado
              </div>
              <div className="text-yellow-700 text-xs space-y-1">
                <p>Opera tiene problemas conocidos con Web Speech API. Si el micrófono no funciona:</p>
                <ul className="list-disc ml-4 mt-1">
                  <li><strong>Recomendado:</strong> Usa Chrome o Microsoft Edge</li>
                  <li>Verifica que el micrófono funcione en Configuración de Windows</li>
                  <li>Prueba escribir texto manualmente en el campo</li>
                </ul>
              </div>
            </div>
          )}

          {/* Permisos de micrófono */}
          {permissionStatus === 'denied' && (
            <div className="p-3 bg-red-100 border border-red-300 rounded text-sm">
              <div className="text-red-700 font-bold mb-2">
                ❌ Micrófono bloqueado
              </div>
              <div className="text-red-600 text-xs space-y-1">
                <p>Para habilitar el micrófono en Opera:</p>
                <ol className="list-decimal ml-4 space-y-1">
                  <li>Haz click en el <strong>icono de candado</strong> 🔒 (izquierda de la URL)</li>
                  <li>Click en <strong>"Configuración del sitio"</strong></li>
                  <li>Busca <strong>"Micrófono"</strong></li>
                  <li>Cambia a <strong>"Permitir"</strong></li>
                  <li>Recarga la página (F5)</li>
                </ol>
              </div>
            </div>
          )}

          {permissionStatus === 'prompt' || permissionStatus === 'unknown' ? (
            <button
              onClick={async () => {
                const granted = await requestPermission();
                if (granted) {
                  console.log('✅ Permisos concedidos, puedes grabar ahora');
                }
              }}
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-bold transition"
            >
              🔓 Solicitar permisos de micrófono
            </button>
          ) : null}

          {/* Estado de conexión */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm">
            <div className="text-blue-900">
              {isListening ? (
                <div className="space-y-1">
                  <div className="animate-pulse">🎙️ <strong>Escuchando...</strong> Habla cerca del micrófono</div>
                  <div className="text-xs text-blue-600 space-y-1">
                    <div>Verifica que el navegador tenga permisos de micrófono</div>
                    {transcript.length === 0 && (
                      <div className="text-orange-600 font-semibold mt-2">
                        ⚠️ No se está capturando texto. Posibles causas:
                        <ul className="list-disc ml-4 mt-1">
                          <li>El micrófono no está detectando sonido</li>
                          <li>El volumen del micrófono es muy bajo</li>
                          <li>Opera no soporta bien Web Speech API</li>
                        </ul>
                        <div className="mt-2 font-bold">
                          → Prueba en Chrome o Edge para mejor compatibilidad
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <span>✅ Listo para capturar voz</span>
              )}
            </div>
          </div>

          {/* Mostrar errores */}
          {error && (
            <div className="p-3 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
              ❌ <strong>Error:</strong> {error}
            </div>
          )}

          {/* Plantillas de descripción */}
          {templates.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📋 Usar una plantilla
              </label>
              <div className="space-y-2">
                {templates.map(template => (
                  <button
                    key={template.id}
                    onClick={() => setTranscript(template.description)}
                    className="w-full text-left p-2 border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-500 transition"
                  >
                    <div className="font-medium text-gray-900">{template.name}</div>
                    <div className="text-xs text-gray-600">{template.description}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TextField para editar manualmente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción del trabajo {transcript && '(se actualiza en tiempo real)'}
            </label>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Describe el trabajo realizado... o usa el micrófono"
              className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-sm"
            />
            {transcript && (
              <div className="text-xs text-gray-500 mt-1">
                {transcript.length} caracteres capturados
              </div>
            )}
            {!transcript && (
              <div className="text-xs text-orange-600 mt-1">
                ⚠️ Escribe texto manualmente o usa el botón de grabar
              </div>
            )}
          </div>

          {/* Botón principal de grabar/parar */}
          <div>
            <button
              onClick={handleToggleRecording}
              className={`w-full py-3 rounded-lg font-bold transition flex items-center justify-center gap-2 text-white text-lg ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              <span className="text-2xl">{isListening ? '⏹️' : '🎤'}</span>
              <span>{isListening ? 'Detener grabación' : 'Empezar a grabar'}</span>
            </button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              {isListening 
                ? 'Click para dejar de grabar' 
                : 'Click para empezar a grabar con micrófono'}
            </p>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-2 justify-end pt-4 border-t">
            <button
              onClick={handleCloseModal}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleClearDescription}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Limpiar
            </button>
            <button
              onClick={handleSaveDescription}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition font-medium disabled:bg-gray-300 disabled:text-gray-700"
              disabled={!transcript.trim()}
            >
              Guardar descripción
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

// Memoize ProjectCard to prevent unnecessary re-renders
export const ProjectCard = memo(ProjectCardComponent);
