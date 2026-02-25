import { useState, useEffect } from 'react';
import { Project, TimeEntry } from './types';
import { useTimer } from './hooks';
import { projectsAPI, timeEntriesAPI } from './services/api';
import { convertSecondsToCentesimal } from './utils/time';
import { ProjectCard } from './components/ProjectCard';
import { ProjectForm } from './components/ProjectForm';
import { AdminView } from './components/AdminView';
import { ExportView } from './components/ExportView';
import { SettingsModal } from './components/SettingsModal';
import { DashboardModal } from './components/DashboardModal';
import { Toast, ConfirmDialog, LoadingSpinner, Modal } from './components/ui';

function App() {
  // Estado de proyectos
  const [projects, setProjects] = useState<Project[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]); // Incluyendo inactivos
  const [loading, setLoading] = useState(true);

  // Estado de registros de tiempo
  const [entries, setEntries] = useState<TimeEntry[]>([]);

  // Modales y diálogos
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>();
  const [showAdminView, setShowAdminView] = useState(false);
  const [showExportView, setShowExportView] = useState(false);
  const [showProjectManager, setShowProjectManager] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);

  // Toast notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);

  // Description drafts por proyecto (mientras timer está corriendo)
  const [descriptionDrafts, setDescriptionDrafts] = useState<{ [projectId: string]: string }>({});

  // Timers pausados por proyecto
  const [pausedTimers, setPausedTimers] = useState<{
    [projectId: string]: { elapsedSeconds: number; pausedAt: number };
  }>({});

  // Drag and drop state
  const [draggedProjectId, setDraggedProjectId] = useState<string | null>(null);
  const [dragOverProjectId, setDragOverProjectId] = useState<string | null>(null);

  // Timer state
  const { timerState, start, reset, stop } = useTimer();

  // Cargar proyectos al montar
  useEffect(() => {
    loadProjects();
    loadEntries();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await projectsAPI.getAll();
      setProjects(data);
    } catch (error) {
      console.error('Error loading projects:', error);
      showToast('Error al cargar proyectos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadEntries = async () => {
    try {
      const data = await timeEntriesAPI.getAll();
      setEntries(data);
    } catch (error) {
      console.error('Error loading entries:', error);
    }
  };

  const isSameDay = (timestampA: number, timestampB: number) => {
    const dateA = new Date(timestampA);
    const dateB = new Date(timestampB);
    return (
      dateA.getFullYear() === dateB.getFullYear() &&
      dateA.getMonth() === dateB.getMonth() &&
      dateA.getDate() === dateB.getDate()
    );
  };

  const pauseCurrentTimer = () => {
    if (!timerState.projectId || !timerState.isRunning) return;
    const pausedAt = Date.now();
    setPausedTimers(prev => ({
      ...prev,
      [timerState.projectId as string]: {
        elapsedSeconds: timerState.elapsedSeconds,
        pausedAt
      }
    }));
    reset();
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, projectId: string) => {
    setDraggedProjectId(projectId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, projectId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverProjectId(projectId);
  };

  const handleDragLeave = () => {
    setDragOverProjectId(null);
  };

  const handleDrop = async (e: React.DragEvent, targetProjectId: string) => {
    e.preventDefault();
    
    if (!draggedProjectId || draggedProjectId === targetProjectId) {
      setDraggedProjectId(null);
      setDragOverProjectId(null);
      return;
    }

    // Encontrar índices
    const draggedIndex = projects.findIndex(p => p.id === draggedProjectId);
    const targetIndex = projects.findIndex(p => p.id === targetProjectId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedProjectId(null);
      setDragOverProjectId(null);
      return;
    }

    // Crear nuevo array reordenado
    const newProjects = [...projects];
    const [removed] = newProjects.splice(draggedIndex, 1);
    newProjects.splice(targetIndex, 0, removed);

    // Actualizar estado localmente
    setProjects(newProjects);

    // Guardar nuevo orden en el servidor
    try {
      await projectsAPI.updateOrder(newProjects);
      showToast('Orden actualizado', 'success');
    } catch (error) {
      console.error('Error updating order:', error);
      showToast('Error al actualizar orden', 'error');
      // Revertir cambios
      setProjects([...projects]);
    }

    setDraggedProjectId(null);
    setDragOverProjectId(null);
  };

  const handleToggleProjectActive = async (projectId: string) => {
    try {
      const updated = await projectsAPI.toggleActive(projectId);
      await loadProjects();
      await loadAllProjectsIncludingInactive();
      showToast(
        updated.isActive ? 'Proyecto activado' : 'Proyecto ocultado',
        'success'
      );
    } catch (error) {
      console.error('Error toggling project:', error);
      showToast('Error al cambiar estado del proyecto', 'error');
    }
  };

  const loadAllProjectsIncludingInactive = async () => {
    try {
      const data = await projectsAPI.getAllIncludingInactive();
      setAllProjects(data);
    } catch (error) {
      console.error('Error loading all projects:', error);
    }
  };

  const handlePlayProject = async (projectId: string) => {
    // Si hay otro proyecto activo, pausarlo sin cerrar la sesion
    if (timerState.projectId && timerState.projectId !== projectId && timerState.isRunning) {
      pauseCurrentTimer();
    }

    const paused = pausedTimers[projectId];
    if (paused) {
      if (isSameDay(paused.pausedAt, Date.now())) {
        start(projectId, paused.elapsedSeconds);
        showToast('Cronómetro reanudado', 'success');
      } else {
        await saveStoppedEntry(
          { projectId, elapsedSeconds: paused.elapsedSeconds },
          paused.pausedAt
        );
        start(projectId);
        showToast('Sesión anterior cerrada. Nuevo cronómetro iniciado', 'info');
      }

      setPausedTimers(prev => {
        const next = { ...prev };
        delete next[projectId];
        return next;
      });
      return;
    }

    start(projectId);
    showToast('Cronómetro iniciado', 'success');
  };

  const handlePauseProject = () => {
    pauseCurrentTimer();
    showToast('Cronómetro pausado', 'warning');
  };

  const handleSaveDescriptionDraft = (projectId: string, description: string) => {
    console.log(`💾 [App] Guardando description draft para proyecto ${projectId}:`, description);
    setDescriptionDrafts(prev => ({
      ...prev,
      [projectId]: description
    }));
  };

  const saveStoppedEntry = async (
    result: { projectId: string; elapsedSeconds: number },
    endedAt: number = Date.now()
  ) => {
    try {
      const durationCentesimal = convertSecondsToCentesimal(result.elapsedSeconds);

      // Usar el draft de descripción si existe
      const description = descriptionDrafts[result.projectId] || '';

      const newEntry: TimeEntry = {
        id: crypto.randomUUID(),
        projectId: result.projectId,
        startTime: new Date(endedAt - result.elapsedSeconds * 1000).toISOString(),
        endTime: new Date(endedAt).toISOString(),
        duration: result.elapsedSeconds,
        durationCentesimal,
        description,
        createdAt: new Date().toISOString(),
      };

      // Guardar en backend
      await timeEntriesAPI.create({
        projectId: newEntry.projectId,
        startTime: newEntry.startTime,
        endTime: newEntry.endTime || new Date().toISOString(),
        duration: newEntry.duration,
        durationCentesimal: newEntry.durationCentesimal,
        description: newEntry.description || '',
      });

      // Limpiar el draft
      setDescriptionDrafts(prev => {
        const newDrafts = { ...prev };
        delete newDrafts[result.projectId];
        return newDrafts;
      });

      // Actualizar proyectos
      await loadProjects();
      await loadEntries();

      showToast(`Registrado: ${durationCentesimal} horas (centesimal)`, 'success');
    } catch (error) {
      console.error('Error stopping timer:', error);
      showToast('Error al guardar tiempo', 'error');
    }
  };

  const handleStopProject = async () => {
    const result = stop();
    if (!result) return;
    await saveStoppedEntry(result);
  };

  const handleStopPausedProject = async (projectId: string) => {
    const paused = pausedTimers[projectId];
    if (!paused) return;
    await saveStoppedEntry(
      { projectId, elapsedSeconds: paused.elapsedSeconds },
      paused.pausedAt
    );
    setPausedTimers(prev => {
      const next = { ...prev };
      delete next[projectId];
      return next;
    });
  };

  const handleCreateProject = async (name: string, description: string) => {
    try {
      await projectsAPI.create(name, description);
      await loadProjects();
      setShowProjectForm(false);
      showToast('Proyecto creado correctamente', 'success');
    } catch (error) {
      throw error;
    }
  };

  const handleUpdateProject = async (name: string, description: string) => {
    if (!editingProject) return;
    try {
      await projectsAPI.update(editingProject.id, name, description);
      await loadProjects();
      setEditingProject(undefined);
      setShowProjectForm(false);
      showToast('Proyecto actualizado', 'success');
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteProject = async () => {
    if (!deleteProjectId) return;
    try {
      await projectsAPI.delete(deleteProjectId);
      await loadProjects();
      setDeleteProjectId(null);
      showToast('Proyecto eliminado', 'success');
    } catch (error) {
      console.error('Error deleting project:', error);
      showToast('Error al eliminar proyecto', 'error');
    }
  };

  const handleExportTxt = () => {
    setShowExportView(true);
  };

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    setToast({ message, type });
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setShowProjectForm(true);
  };

  const handleOpenProjectForm = () => {
    setEditingProject(undefined);
    setShowProjectForm(true);
  };

  const handleCloseProjectForm = () => {
    setShowProjectForm(false);
    setEditingProject(undefined);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">⏱️ Control de Partes</h1>
              <p className="text-gray-600 mt-1">Sistema moderno de seguimiento de horas</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleOpenProjectForm}
                className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition"
              >
                ➕ Nuevo Proyecto
              </button>
              <button
                onClick={() => setShowDashboard(true)}
                className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-semibold transition"
              >
                📊 Dashboard
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-semibold transition"
              >
                ⚙️ Plantillas
              </button>
              <button
                onClick={() => {
                  setShowProjectManager(true);
                  loadAllProjectsIncludingInactive();
                }}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg font-semibold transition"
              >
                🏢 Proyectos
              </button>
              <button
                onClick={() => setShowAdminView(true)}
                className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold transition"
              >
                📋 Administración
              </button>
              <button
                onClick={handleExportTxt}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition"
              >
                📥 Exportar TXT
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {projects.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-gray-600 mb-6">No hay proyectos creados</p>
            <button
              onClick={handleOpenProjectForm}
              className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition"
            >
              Crear primer proyecto
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                isActive={timerState.projectId === project.id && timerState.isRunning}
                isPaused={Boolean(pausedTimers[project.id])}
                elapsedSeconds={
                  timerState.projectId === project.id ? timerState.elapsedSeconds : 0
                }
                pausedElapsedSeconds={pausedTimers[project.id]?.elapsedSeconds || 0}
                onPlay={handlePlayProject}
                onPause={handlePauseProject}
                onStop={handleStopProject}
                onStopPaused={handleStopPausedProject}
                onSaveDescriptionDraft={handleSaveDescriptionDraft}
                currentDescriptionDraft={descriptionDrafts[project.id] || ''}
                isDragged={draggedProjectId === project.id}
                isDragOver={dragOverProjectId === project.id}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modales */}
      <ProjectForm
        isOpen={showProjectForm}
        project={editingProject}
        onClose={handleCloseProjectForm}
        onSubmit={editingProject ? handleUpdateProject : handleCreateProject}
      />

      <AdminView
        isOpen={showAdminView}
        onClose={() => setShowAdminView(false)}
        entries={entries}
        projects={projects}
        onEdit={async (entry) => {
          try {
            await timeEntriesAPI.update(entry.id, {
              description: entry.description,
              duration: entry.duration,
              durationCentesimal: entry.durationCentesimal,
            });
            await loadEntries();
            showToast('Registro actualizado', 'success');
          } catch (error) {
            showToast('Error al actualizar registro', 'error');
          }
        }}
        onDelete={async (entryId) => {
          try {
            await timeEntriesAPI.delete(entryId);
            await loadEntries();
            showToast('Registro eliminado', 'success');
          } catch (error) {
            showToast('Error al eliminar registro', 'error');
          }
        }}
      />

      <Modal
        isOpen={showProjectManager}
        title="Gestion de proyectos"
        onClose={() => setShowProjectManager(false)}
        size="lg"
      >
        <div className="space-y-6">
          {/* Proyectos Activos */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">📌 Proyectos Activos ({projects.length})</h3>
            {projects.length === 0 ? (
              <div className="text-sm text-gray-600">No hay proyectos activos.</div>
            ) : (
              <div className="space-y-2">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-start justify-between gap-3 rounded-lg border border-gray-200 p-3 bg-gray-50"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-gray-900 truncate">
                        {project.name}
                      </div>
                      <div className="text-xs text-gray-600">
                        {project.description}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setShowProjectManager(false);
                          handleEditProject(project);
                        }}
                        className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-xs font-semibold transition"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => handleToggleProjectActive(project.id)}
                        className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md text-xs font-semibold transition"
                      >
                        👁️ Ocultar
                      </button>
                      <button
                        onClick={() => setDeleteProjectId(project.id)}
                        className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-md text-xs font-semibold transition"
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Proyectos Ocultos */}
          {(() => {
            const inactiveProjects = allProjects.filter(p => p.isActive === 0);
            return inactiveProjects.length > 0 ? (
              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-900 mb-3">👁️‍🗨️ Proyectos Ocultos ({inactiveProjects.length})</h3>
                <div className="space-y-2">
                  {inactiveProjects.map((project) => (
                    <div
                      key={project.id}
                      className="flex items-start justify-between gap-3 rounded-lg border border-gray-300 border-dashed p-3 bg-gray-100"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-gray-600 truncate">
                          {project.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {project.description}
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => handleToggleProjectActive(project.id)}
                          className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-md text-xs font-semibold transition"
                        >
                          👁️ Activar
                        </button>
                        <button
                          onClick={() => setDeleteProjectId(project.id)}
                          className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-md text-xs font-semibold transition"
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null;
          })()}
        </div>
      </Modal>

      {/* Delete Confirmation Dialog */}
      {deleteProjectId && (
        <ConfirmDialog
          title="Eliminar proyecto"
          message="¿Estás seguro de que deseas eliminar este proyecto? Esta acción no se puede deshacer."
          onConfirm={handleDeleteProject}
          onCancel={() => setDeleteProjectId(null)}
          confirmText="Eliminar"
          isDanger
        />
      )}

      <ExportView
        isOpen={showExportView}
        onClose={() => setShowExportView(false)}
        entries={entries}
        projects={projects}
        onExportSuccess={() => showToast('Archivo exportado correctamente', 'success')}
        onExportError={(error) => showToast(error, 'error')}
      />

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

      <DashboardModal
        isOpen={showDashboard}
        onClose={() => setShowDashboard(false)}
        entries={entries}
        projects={projects}
      />

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default App;
