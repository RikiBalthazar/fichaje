import { useState } from 'react';
import { Modal } from './ui';
import { User } from '../types';
import { authAPI } from '../services/api';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onLogout: () => void;
  onPasswordChanged: () => void;
}

export function AccountModal({ isOpen, onClose, user, onLogout, onPasswordChanged }: AccountModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError('La nueva contrasena debe tener al menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contrasenas no coinciden');
      return;
    }

    setLoading(true);
    try {
      await authAPI.changePassword(currentPassword, newPassword);
      resetForm();
      onPasswordChanged();
    } catch (err: any) {
      const message = err?.response?.data?.error || 'No se pudo cambiar la contrasena';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    setExportLoading(true);
    try {
      const response = await fetch('/api/backup/json', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) throw new Error('Error al exportar datos');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Error al exportar datos');
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} title="Cuenta" onClose={handleClose} size="sm">
        <div className="space-y-6">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
            <div className="font-semibold">Usuario</div>
            <div className="text-gray-600">{user.email}</div>
          </div>

          <form className="space-y-3" onSubmit={handleChangePassword}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Contrasena actual</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Nueva contrasena</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                minLength={6}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Confirmar contrasena</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                minLength={6}
                required
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition disabled:opacity-60"
            >
              {loading ? 'Actualizando...' : 'Cambiar contrasena'}
            </button>
          </form>

          <div className="border-t pt-4">
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">📦 Backup y Datos</h3>
              <p className="text-xs text-gray-600 mb-3">
                Descarga una copia de seguridad de todos tus datos o restaura una copia anterior.
              </p>
            </div>

            <div className="flex gap-2 flex-col sm:flex-row">
              <button
                onClick={handleExportData}
                disabled={exportLoading}
                className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition disabled:opacity-60 text-sm"
              >
                {exportLoading ? 'Exportando...' : '⬇️ Descargar datos'}
              </button>
              <button
                onClick={() => setShowImportModal(true)}
                className="flex-1 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold transition text-sm"
              >
                ⬆️ Restaurar backup
              </button>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full py-2 border border-red-300 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition"
          >
            Cerrar sesion
          </button>
        </div>
      </Modal>

      {showImportModal && (
        <ImportModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onImportSuccess={() => window.location.reload()}
        />
      )}
    </>
  );
}

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: () => void;
}

function ImportModal({ isOpen, onClose, onImportSuccess }: ImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<'replace' | 'merge'>('replace');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.name.endsWith('.json')) {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('Por favor selecciona un archivo JSON válido');
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('Por favor selecciona un archivo');
      return;
    }

    setLoading(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      const response = await fetch('/api/backup/json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ data, mode })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Error al importar');
      }

      const result = await response.json();
      setError(null);
      alert(result.message || 'Datos importados correctamente');
      onImportSuccess();
    } catch (err: any) {
      setError(err.message || 'Error al importar datos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} title="Restaurar Backup" onClose={onClose} size="sm">
      <div className="space-y-4">
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
          <strong>⚠️ Modo de restauración:</strong><br/>
          <small>
            <strong>Reemplazar:</strong> Elimina todos tus datos actuales e importa el backup<br/>
            <strong>Fusionar:</strong> Combina el backup con tus datos actuales
          </small>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Modo de importación</label>
          <div className="flex gap-3">
            <label className="flex items-center">
              <input
                type="radio"
                value="replace"
                checked={mode === 'replace'}
                onChange={(e) => setMode(e.target.value as 'replace' | 'merge')}
                className="mr-2"
              />
              <span className="text-sm">Reemplazar todo</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="merge"
                checked={mode === 'merge'}
                onChange={(e) => setMode(e.target.value as 'replace' | 'merge')}
                className="mr-2"
              />
              <span className="text-sm">Fusionar datos</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Selecciona archivo JSON</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50">
            <input
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="w-full"
            />
            {file && <p className="text-sm text-green-600 mt-2">✓ {file.name}</p>}
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleImport}
            disabled={!file || loading}
            className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:opacity-60"
          >
            {loading ? 'Importando...' : 'Importar datos'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
