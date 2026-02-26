import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../database/index.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { convertSecondsToCentesimal } from '../utils/helpers.js';

interface TimerStateResponse {
  active: {
    projectId: string;
    startedAt: string;
    accumulatedSeconds: number;
  } | null;
  paused: Array<{
    projectId: string;
    accumulatedSeconds: number;
  }>;
}

async function buildTimerState(userId: string): Promise<TimerStateResponse> {
  const db = getDb();
  const timers = await db.all<any[]>(
    'SELECT * FROM project_timers WHERE user_id = ?',
    [userId]
  );

  const activeRow = timers.find(t => t.is_running === 1);
  const pausedRows = timers.filter(t => t.is_running === 0 && t.accumulated_seconds > 0);

  return {
    active: activeRow
      ? {
          projectId: activeRow.project_id,
          startedAt: activeRow.started_at,
          accumulatedSeconds: activeRow.accumulated_seconds
        }
      : null,
    paused: pausedRows.map(row => ({
      projectId: row.project_id,
      accumulatedSeconds: row.accumulated_seconds
    }))
  };
}

async function pauseRunningTimer(userId: string, now: number): Promise<void> {
  const db = getDb();
  const running = await db.get<any>(
    'SELECT * FROM project_timers WHERE user_id = ? AND is_running = 1',
    [userId]
  );

  if (!running) return;

  const startedAt = running.started_at ? new Date(running.started_at).getTime() : now;
  const deltaSeconds = Math.max(0, Math.floor((now - startedAt) / 1000));
  const updatedAt = new Date(now).toISOString();

  await db.run(
    'UPDATE project_timers SET accumulated_seconds = ?, started_at = NULL, is_running = 0, updated_at = ? WHERE id = ? AND user_id = ?',
    [running.accumulated_seconds + deltaSeconds, updatedAt, running.id, userId]
  );
}

export async function getTimerState(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    const state = await buildTimerState(userId);
    res.json(state);
  } catch (error) {
    console.error('Error getting timer state:', error);
    res.status(500).json({ error: 'Error al obtener el estado del temporizador' });
  }
}

export async function startTimer(req: Request, res: Response): Promise<void> {
  try {
    const { projectId } = req.body as { projectId?: string };
    const userId = (req as AuthenticatedRequest).user.id;

    if (!projectId) {
      res.status(400).json({ error: 'projectId es requerido' });
      return;
    }

    const db = getDb();
    const project = await db.get<any>(
      'SELECT id FROM projects WHERE id = ? AND user_id = ?',
      [projectId, userId]
    );

    if (!project) {
      res.status(404).json({ error: 'Proyecto no encontrado' });
      return;
    }

    const now = Date.now();
    await pauseRunningTimer(userId, now);

    const existing = await db.get<any>(
      'SELECT * FROM project_timers WHERE user_id = ? AND project_id = ?',
      [userId, projectId]
    );

    const timestamp = new Date(now).toISOString();

    if (existing) {
      await db.run(
        'UPDATE project_timers SET started_at = ?, is_running = 1, updated_at = ? WHERE id = ? AND user_id = ?',
        [timestamp, timestamp, existing.id, userId]
      );
    } else {
      const id = uuidv4();
      await db.run(
        'INSERT INTO project_timers (id, user_id, project_id, accumulated_seconds, started_at, is_running, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [id, userId, projectId, 0, timestamp, 1, timestamp, timestamp]
      );
    }

    const state = await buildTimerState(userId);
    res.json(state);
  } catch (error) {
    console.error('Error starting timer:', error);
    res.status(500).json({ error: 'Error al iniciar el temporizador' });
  }
}

export async function pauseTimer(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    const now = Date.now();

    await pauseRunningTimer(userId, now);
    const state = await buildTimerState(userId);
    res.json(state);
  } catch (error) {
    console.error('Error pausing timer:', error);
    res.status(500).json({ error: 'Error al pausar el temporizador' });
  }
}

export async function stopTimer(req: Request, res: Response): Promise<void> {
  try {
    const { projectId, description = '' } = req.body as { projectId?: string; description?: string };
    const userId = (req as AuthenticatedRequest).user.id;

    if (!projectId) {
      res.status(400).json({ error: 'projectId es requerido' });
      return;
    }

    const db = getDb();
    const timer = await db.get<any>(
      'SELECT * FROM project_timers WHERE user_id = ? AND project_id = ?',
      [userId, projectId]
    );

    if (!timer) {
      res.status(404).json({ error: 'Temporizador no encontrado' });
      return;
    }

    const now = Date.now();
    const startedAtMs = timer.started_at ? new Date(timer.started_at).getTime() : now;
    const deltaSeconds = timer.is_running === 1
      ? Math.max(0, Math.floor((now - startedAtMs) / 1000))
      : 0;
    const totalSeconds = timer.accumulated_seconds + deltaSeconds;

    if (totalSeconds <= 0) {
      await db.run('DELETE FROM project_timers WHERE id = ? AND user_id = ?', [timer.id, userId]);
      const state = await buildTimerState(userId);
      res.json({ state });
      return;
    }

    const startTime = new Date(now - totalSeconds * 1000).toISOString();
    const endTime = new Date(now).toISOString();
    const durationCentesimal = convertSecondsToCentesimal(totalSeconds);
    const entryId = uuidv4();
    const createdAt = new Date(now).toISOString();

    await db.run(
      `INSERT INTO time_entries
       (id, user_id, project_id, start_time, end_time, duration, duration_centesimal, description, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [entryId, userId, projectId, startTime, endTime, totalSeconds, durationCentesimal, description, createdAt]
    );

    await db.run('DELETE FROM project_timers WHERE id = ? AND user_id = ?', [timer.id, userId]);

    const state = await buildTimerState(userId);
    res.json({
      entry: {
        id: entryId,
        projectId,
        startTime,
        endTime,
        duration: totalSeconds,
        durationCentesimal,
        description,
        createdAt
      },
      state
    });
  } catch (error) {
    console.error('Error stopping timer:', error);
    res.status(500).json({ error: 'Error al detener el temporizador' });
  }
}
