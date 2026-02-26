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

  return (
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

        <button
          onClick={onLogout}
          className="w-full py-2 border border-red-300 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition"
        >
          Cerrar sesion
        </button>
      </div>
    </Modal>
  );
}
