import { useState, type FormEvent } from 'react';
import { authAPI } from '../services/api';
import { User } from '../types';

interface AuthViewProps {
  onAuthSuccess: (user: User) => void;
}

export function AuthView({ onAuthSuccess }: AuthViewProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = isRegister
        ? await authAPI.register(email, password)
        : await authAPI.login(email, password);

      localStorage.setItem('authToken', response.token);
      onAuthSuccess(response.user);
    } catch (err: any) {
      const message = err?.response?.data?.error || 'No se pudo autenticar';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-gray-900">Control de Partes</h1>
        <p className="text-sm text-gray-600 mt-1">
          {isRegister ? 'Crea tu cuenta para empezar' : 'Inicia sesion para continuar'}
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="tu@email.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Contrasena</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Minimo 6 caracteres"
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
            {loading ? 'Procesando...' : isRegister ? 'Crear cuenta' : 'Iniciar sesion'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setIsRegister((prev) => !prev)}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            {isRegister ? 'Ya tienes cuenta? Inicia sesion' : 'No tienes cuenta? Registrate'}
          </button>
        </div>
      </div>
    </div>
  );
}
