import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../database/index.js';
import { signToken, AuthenticatedRequest } from '../middleware/auth.js';

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

async function assignLegacyDataToUser(userId: string): Promise<void> {
  const db = getDb();
  await db.run(
    'UPDATE projects SET user_id = ? WHERE user_id IS NULL OR user_id = ""',
    [userId]
  );
  await db.run(
    'UPDATE time_entries SET user_id = ? WHERE user_id IS NULL OR user_id = ""',
    [userId]
  );
  await db.run(
    'UPDATE description_templates SET user_id = ? WHERE user_id IS NULL OR user_id = ""',
    [userId]
  );
}

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      res.status(400).json({ error: 'Email y contraseña son requeridos' });
      return;
    }

    const normalizedEmail = normalizeEmail(email);

    if (password.length < 6) {
      res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
      return;
    }

    const db = getDb();
    const existing = await db.get('SELECT id FROM users WHERE email = ?', [normalizedEmail]);

    if (existing) {
      res.status(409).json({ error: 'El email ya está registrado' });
      return;
    }

    const id = uuidv4();
    const now = new Date().toISOString();
    const passwordHash = await bcrypt.hash(password, 10);

    await db.run(
      'INSERT INTO users (id, email, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
      [id, normalizedEmail, passwordHash, now, now]
    );

    const usersCount = await db.get<{ total: number }>('SELECT COUNT(*) as total FROM users');
    if (usersCount?.total === 1) {
      await assignLegacyDataToUser(id);
    }

    const token = signToken({ id, email: normalizedEmail });
    res.status(201).json({ token, user: { id, email: normalizedEmail } });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      res.status(400).json({ error: 'Email y contraseña son requeridos' });
      return;
    }

    const normalizedEmail = normalizeEmail(email);
    const db = getDb();
    const user = await db.get<{ id: string; email: string; password_hash: string }>(
      'SELECT id, email, password_hash FROM users WHERE email = ?',
      [normalizedEmail]
    );

    if (!user) {
      res.status(401).json({ error: 'Credenciales inválidas' });
      return;
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      res.status(401).json({ error: 'Credenciales inválidas' });
      return;
    }

    const token = signToken({ id: user.id, email: user.email });
    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
}

export async function me(req: Request, res: Response): Promise<void> {
  const authReq = req as AuthenticatedRequest;
  res.json({ user: authReq.user });
}

export async function changePassword(req: Request, res: Response): Promise<void> {
  try {
    const { currentPassword, newPassword } = req.body as {
      currentPassword?: string;
      newPassword?: string;
    };
    const authReq = req as AuthenticatedRequest;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: 'La contrasena actual y la nueva son requeridas' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ error: 'La nueva contrasena debe tener al menos 6 caracteres' });
      return;
    }

    const db = getDb();
    const user = await db.get<{ id: string; password_hash: string }>(
      'SELECT id, password_hash FROM users WHERE id = ?',
      [authReq.user.id]
    );

    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValid) {
      res.status(401).json({ error: 'La contrasena actual no es correcta' });
      return;
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    const updatedAt = new Date().toISOString();

    await db.run(
      'UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?',
      [newHash, updatedAt, authReq.user.id]
    );

    res.json({ message: 'Contrasena actualizada' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Error al cambiar la contrasena' });
  }
}
