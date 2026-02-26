import { useState, useEffect, useMemo } from 'react';
import { Project, TimeEntry, User } from './types';
import { useTimer } from './hooks';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useWorkingHoursAlert } from './hooks/useWorkingHoursAlert';
import { projectsAPI, timeEntriesAPI, authAPI } from './services/api';
import { ProjectCard } from './components/ProjectCard';
import { ProjectForm } from './components/ProjectForm';
import { AdminView } from './components/AdminView';
import { ExportView } from './components/ExportView';
import { SettingsModal } from './components/SettingsModal';
import { DashboardModal } from './components/DashboardModal';
import { AuthView } from './components/AuthView';
import { AccountModal } from './components/AccountModal';
import { KeyboardHelp } from './components/KeyboardHelp';
import { Toast as ToastComponent, ToastMessage } from './components/Toast';
import { Toast, ConfirmDialog, LoadingSpinner, Modal } from './components/ui';
import { TAG_COLORS, DEFAULT_COLOR } from './components/TagInput';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

function App() {
  // Estado de proyectos
  const [projects, setProjects] = useState<Project[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]); // Incluyendo inactivos
  const [loading, setLoading] = useState(true);

  // Auth
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

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
  const [showAccount, setShowAccount] = useState(false);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);

  // PWA install prompt
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);

  // Toast notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);
  const [toastMessage, setToastMessage] = useState<ToastMessage | null>(null);

  // Keyboard help
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [descriptionModalProjectId, setDescriptionModalProjectId] = useState<string | null>(null);

  // Description drafts por proyecto (mientras timer está corriendo)
  const [descriptionDrafts, setDescriptionDrafts] = useState<{ [projectId: string]: string }>({});

  // Drag and drop state
  const [draggedProjectId, setDraggedProjectId] = useState<string | null>(null);
  const [dragOverProjectId, setDragOverProjectId] = useState<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Timer state
  const { timerState, pausedTimers, start, pause, stop } = useTimer(Boolean(user));

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setAuthLoading(false);
        return;
      }

      try {
        const { user: currentUser } = await authAPI.me();
        setUser(currentUser);
      } catch (error) {
        localStorage.removeItem('authToken');
      } finally {
        setAuthLoading(false);
      }
    };

    initAuth();
  }, []);

  useEffect(() => {
    const handleBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
      setCanInstall(true);
    };

    const handleInstalled = () => {
      setInstallPrompt(null);
      setCanInstall(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  // Cargar proyectos al autenticar
  useEffect(() => {
    if (!user) return;
    loadProjects();
    loadEntries();
  }, [user]);

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

  // Calculate today's minutes per project
  const getTodayMinutesByProject = (): { [projectId: string]: number } => {
    const today = new Date().toDateString();
    const todayEntries = entries.filter(entry => 
      new Date(entry.createdAt).toDateString() === today
    );

    const minutesByProject: { [projectId: string]: number } = {};
    todayEntries.forEach(entry => {
      if (!minutesByProject[entry.projectId]) {
        minutesByProject[entry.projectId] = 0;
      }
      // entry.duration está en SEGUNDOS, convertir a minutos
      minutesByProject[entry.projectId] += Math.floor(entry.duration / 60);
    });

    // Add active timer if running
    if (timerState.isRunning && timerState.projectId) {
      if (!minutesByProject[timerState.projectId]) {
        minutesByProject[timerState.projectId] = 0;
      }
      minutesByProject[timerState.projectId] += Math.floor(timerState.elapsedSeconds / 60);
    }

    return minutesByProject;
  };

  // Sort projects: Favorites → Recent → Rest
  const sortProjects = (projectsList: Project[]): Project[] => {
    return [...projectsList].sort((a, b) => {
      // 1. Favorites first
      if (a.isFavorite !== b.isFavorite) {
        return b.isFavorite - a.isFavorite;
      }

      // 2. Then by lastUsedAt (recent first)
      if (a.lastUsedAt && b.lastUsedAt) {
        return new Date(b.lastUsedAt).getTime() - new Date(a.lastUsedAt).getTime();
      }
      if (a.lastUsedAt) return -1;
      if (b.lastUsedAt) return 1;

      // 3. Finally alphabetically
      return a.name.localeCompare(b.name);
    });
  };

  // Handle toggle favorite
  const handleToggleFavorite = async (projectId: string) => {
    try {
      await projectsAPI.toggleFavorite(projectId);
      await loadProjects();
      showToast('Favorito actualizado', 'success');
    } catch (error) {
      console.error('Error toggling favorite:', error);
      showToast('Error al actualizar favorito', 'error');
    }
  };

  // Search and filter projects
  const filteredProjects = useMemo(() => {
    let filtered = projects;

    // Filter by search query (mantener funcionalidad interna)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(project => 
        project.name.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query)
      );
    }

    // Filter by selected tag
    if (selectedTag) {
      filtered = filtered.filter(project => {
        try {
          const projectTags = JSON.parse(project.tags || '[]');
          return projectTags.includes(selectedTag);
        } catch (e) {
          return false;
        }
      });
    }

    return filtered;
  }, [projects, searchQuery, selectedTag]);

  // Get all unique tags from projects
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    projects.forEach(project => {
      try {
        const projectTags = JSON.parse(project.tags || '[]');
        projectTags.forEach((tag: string) => tagsSet.add(tag));
      } catch (e) {
        // Ignore invalid JSON
      }
    });
    return Array.from(tagsSet).sort();
  }, [projects]);

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
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
    console.log('▶️ handlePlayProject called with projectId:', projectId);
    try {
      const wasPaused = Boolean(pausedTimers[projectId]);
      await start(projectId);
      showToast(wasPaused ? 'Cronómetro reanudado' : 'Cronómetro iniciado', 'success');
    } catch (error) {
      console.error('Error starting timer:', error);
      showToast('Error al iniciar cronómetro', 'error');
    }
  };

  const handleVoiceRecord = () => {
    console.log('🎤 handleVoiceRecord called');
    const activeProjectId = timerState?.projectId;
    if (!activeProjectId) {
      console.log('⚠️ handleVoiceRecord: No active project');
      setToastMessage({
        id: Date.now().toString(),
        message: '⚠️ No hay proyecto activo',
        type: 'warning',
        duration: 3000
      });
      return;
    }

    // Abrir modal de descripción del proyecto activo
    setDescriptionModalProjectId(activeProjectId);
    console.log(`🎤 Abriendo modal de descripción para proyecto ${activeProjectId}`);
  };

  const handlePauseProject = async () => {
    console.log('⏸️ handlePauseProject called');
    try {
      await pause();
      showToast('Cronómetro pausado', 'warning');
    } catch (error) {
      console.error('Error pausing timer:', error);
      showToast('Error al pausar cronómetro', 'error');
    }
  };

  const handleSaveDescriptionDraft = (projectId: string, description: string) => {
    console.log(`💾 [App] Guardando description draft para proyecto ${projectId}:`, description);
    setDescriptionDrafts(prev => ({
      ...prev,
      [projectId]: description
    }));
  };

  const handleStopProject = async () => {
    console.log('⏹️ handleStopProject called. timerState.projectId:', timerState.projectId);
    if (!timerState.projectId) {
      console.log('⚠️ handleStopProject: No active project');
      return;
    }
    const description = descriptionDrafts[timerState.projectId] || '';

    try {
      const entry = await stop(timerState.projectId, description);
      if (entry) {
        setDescriptionDrafts(prev => {
          const next = { ...prev };
          delete next[timerState.projectId as string];
          return next;
        });
        await loadProjects();
        await loadEntries();
        showToast(`Registrado: ${entry.durationCentesimal} horas (centesimal)`, 'success');
      }
    } catch (error) {
      console.error('Error stopping timer:', error);
      showToast('Error al guardar tiempo', 'error');
    }
  };

  const handleStopPausedProject = async (projectId: string) => {
    const description = descriptionDrafts[projectId] || '';
    try {
      const entry = await stop(projectId, description);
      if (entry) {
        setDescriptionDrafts(prev => {
          const next = { ...prev };
          delete next[projectId];
          return next;
        });
        await loadProjects();
        await loadEntries();
        showToast(`Registrado: ${entry.durationCentesimal} horas (centesimal)`, 'success');
      }
    } catch (error) {
      console.error('Error stopping paused timer:', error);
      showToast('Error al guardar tiempo', 'error');
    }
  };

  const handleCreateProject = async (
    name: string,
    description: string,
    tags: string[] = [],
    targetMinutes: number | null = null
  ) => {
    try {
      await projectsAPI.create(name, description, tags, targetMinutes);
      await loadProjects();
      setShowProjectForm(false);
      showToast('Proyecto creado correctamente', 'success');
    } catch (error) {
      throw error;
    }
  };

  const handleUpdateProject = async (
    name: string,
    description: string,
    tags: string[] = [],
    targetMinutes: number | null = null
  ) => {
    if (!editingProject) return;
    try {
      await projectsAPI.update(editingProject.id, name, description, tags, targetMinutes);
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

  const handleInstallApp = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    setInstallPrompt(null);
    setCanInstall(false);
    showToast(
      choice.outcome === 'accepted' ? 'App instalada correctamente' : 'Instalacion cancelada',
      choice.outcome === 'accepted' ? 'success' : 'info'
    );
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

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    setProjects([]);
    setAllProjects([]);
    setEntries([]);
    setDescriptionDrafts({});
    setShowAccount(false);
  };

  // Keyboard shortcuts (después de que todas las funciones están definidas)
  useKeyboardShortcuts({
    onPlay: handlePlayProject,
    onPause: handlePauseProject,
    onStop: handleStopProject,
    onVoiceRecord: handleVoiceRecord,
    onToggleHelp: () => setShowKeyboardHelp(!showKeyboardHelp),
    onFocusSearch: () => {
      // Focus en el input de búsqueda
      const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
      }
    },
    projectIds: projects.map(p => p.id),
    isAnyModalOpen: showProjectForm || showAdminView || showExportView || showProjectManager || showSettings || showDashboard || showAccount || showKeyboardHelp || deleteProjectId !== null
  });

  // Calcular minutos trabajados hoy para alerta de horas
  const calculateTodayMinutes = () => {
    if (!entries || entries.length === 0) return 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const minutesToday = entries.reduce((total, entry) => {
      // Usar createdAt para determinar si fue hoy
      const entryDate = new Date(entry.createdAt);
      entryDate.setHours(0, 0, 0, 0);
      
      if (entryDate.getTime() === today.getTime()) {
        // Convertir duration (segundos) a minutos
        const minutes = Math.floor(entry.duration / 60);
        return total + minutes;
      }
      return total;
    }, 0);
    
    console.log(`📊 Minutos trabajados hoy: ${minutesToday} (${Math.floor(minutesToday / 60)}h ${minutesToday % 60}m)`);
    return minutesToday;
  };

  // Working hours alert hook
  useWorkingHoursAlert({
    elapsedSeconds: timerState.isRunning ? timerState.elapsedSeconds : 0,
    totalMinutesToday: calculateTodayMinutes(),
    timerRunning: timerState.isRunning,
    onAlert: (message) => {
      console.log('🔔 Alert callback:', message);
      setToastMessage({
        id: Date.now().toString(),
        message,
        type: 'warning',
        duration: 0 // No auto-dismiss para alertas críticas
      });
    }
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return <AuthView onAuthSuccess={setUser} />;
  }

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
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center gap-4">
            <div className="flex-shrink-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">⏱️ Control de Partes</h1>
              <p className="text-gray-600 mt-0.5 text-sm hidden sm:block">Sistema moderno de seguimiento de horas</p>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex gap-2 items-center flex-shrink-0">
              <button
                onClick={handleOpenProjectForm}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition text-sm"
              >
                ➕ Nuevo Proyecto
              </button>
              <button
                onClick={() => setShowDashboard(true)}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-semibold transition text-sm"
              >
                📊 Dashboard
              </button>
              {canInstall && (
                <button
                  onClick={handleInstallApp}
                  className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-semibold transition text-sm"
                >
                  ⬇️ Instalar
                </button>
              )}
              <button
                onClick={handleExportTxt}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition text-sm"
              >
                📥 Exportar
              </button>
              
              {/* Settings Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg font-semibold transition text-sm flex items-center gap-1"
                >
                  ⚙️ Configuración
                  <span className="text-xs">{showSettingsDropdown ? '▲' : '▼'}</span>
                </button>
                
                {showSettingsDropdown && (
                  <>
                    {/* Backdrop para cerrar el dropdown */}
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowSettingsDropdown(false)}
                    />
                    
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-20">
                      <button
                        onClick={() => {
                          setShowAccount(true);
                          setShowSettingsDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 text-sm flex items-center gap-2"
                      >
                        👤 Mi Cuenta
                      </button>
                      <button
                        onClick={() => {
                          setShowSettings(true);
                          setShowSettingsDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 text-sm flex items-center gap-2"
                      >
                        📝 Plantillas
                      </button>
                      <button
                        onClick={() => {
                          setShowProjectManager(true);
                          loadAllProjectsIncludingInactive();
                          setShowSettingsDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 text-sm flex items-center gap-2"
                      >
                        🏢 Config. Proyectos
                      </button>
                      <button
                        onClick={() => {
                          setShowAdminView(true);
                          setShowSettingsDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 text-sm flex items-center gap-2"
                      >
                        📋 Administración
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden px-3 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg"
            >
              <span className="text-xl">{showMobileMenu ? '✕' : '☰'}</span>
            </button>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="md:hidden mt-4 pb-2 border-t border-gray-200 pt-4 space-y-2">
              <button
                onClick={() => {
                  handleOpenProjectForm();
                  setShowMobileMenu(false);
                }}
                className="w-full text-left px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold text-sm"
              >
                ➕ Nuevo Proyecto
              </button>
              <button
                onClick={() => {
                  setShowDashboard(true);
                  setShowMobileMenu(false);
                }}
                className="w-full text-left px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-semibold text-sm"
              >
                📊 Dashboard
              </button>
              {canInstall && (
                <button
                  onClick={() => {
                    handleInstallApp();
                    setShowMobileMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-semibold text-sm"
                >
                  ⬇️ Instalar
                </button>
              )}
              <button
                onClick={() => {
                  handleExportTxt();
                  setShowMobileMenu(false);
                }}
                className="w-full text-left px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold text-sm"
              >
                📥 Exportar
              </button>
              
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="text-xs text-gray-500 px-4 py-1 font-semibold">CONFIGURACIÓN</div>
                <button
                  onClick={() => {
                    setShowAccount(true);
                    setShowMobileMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 text-sm"
                >
                  👤 Mi Cuenta
                </button>
                <button
                  onClick={() => {
                    setShowSettings(true);
                    setShowMobileMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 text-sm"
                >
                  📝 Plantillas
                </button>
                <button
                  onClick={() => {
                    setShowProjectManager(true);
                    loadAllProjectsIncludingInactive();
                    setShowMobileMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 text-sm"
                >
                  🏢 Config. Proyectos
                </button>
                <button
                  onClick={() => {
                    setShowAdminView(true);
                    setShowMobileMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 text-sm"
                >
                  📋 Administración
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Tag Filter Buttons */}
        {allTags.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  !selectedTag
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todos los proyectos
              </button>
              {allTags.map((tag) => {
                const colorClass = TAG_COLORS[tag] || DEFAULT_COLOR;
                const isSelected = selectedTag === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all ${
                      isSelected
                        ? colorClass + ' ring-2 ring-offset-2 ring-blue-500'
                        : colorClass + ' hover:scale-105'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        )}

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
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-gray-600 mb-2">🔍 No se encontraron proyectos</p>
            <p className="text-sm text-gray-500">
              {selectedTag ? `No hay proyectos con el tag "${selectedTag}"` : 'Intenta con otro filtro'}
            </p>
            <button
              onClick={() => {
                setSelectedTag(null);
                handleSearch('');
              }}
              className="mt-4 px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortProjects(filteredProjects).map((project) => {
              const todayMinutesByProject = getTodayMinutesByProject();
              return (
                <ProjectCard
                  key={project.id}
                  project={project}
                  isActive={timerState.projectId === project.id && timerState.isRunning}
                  isPaused={Boolean(pausedTimers[project.id])}
                  elapsedSeconds={
                    timerState.projectId === project.id ? timerState.elapsedSeconds : 0
                  }
                  pausedElapsedSeconds={pausedTimers[project.id] || 0}
                  onPlay={handlePlayProject}
                  onPause={handlePauseProject}
                  onStop={handleStopProject}
                  onStopPaused={handleStopPausedProject}
                  onSaveDescriptionDraft={handleSaveDescriptionDraft}
                  onToggleFavorite={handleToggleFavorite}
                  todayMinutes={todayMinutesByProject[project.id] || 0}
                  currentDescriptionDraft={descriptionDrafts[project.id] || ''}
                  isDragged={draggedProjectId === project.id}
                  isDragOver={dragOverProjectId === project.id}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  forceOpenDescriptionModal={descriptionModalProjectId === project.id}
                  onDescriptionModalClose={() => setDescriptionModalProjectId(null)}
                />
              );
            })}
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
        onProjectsChange={async () => {
          await loadProjects();
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

      {user && (
        <AccountModal
          isOpen={showAccount}
          onClose={() => setShowAccount(false)}
          user={user}
          onLogout={handleLogout}
          onPasswordChanged={() => showToast('Contrasena actualizada', 'success')}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Toast Nueva */}
      <ToastComponent toast={toastMessage} onClose={() => setToastMessage(null)} />

      {/* Keyboard Help Modal */}
      <KeyboardHelp isOpen={showKeyboardHelp} onClose={() => setShowKeyboardHelp(false)} />
    </div>
  );
}

export default App;
