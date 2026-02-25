import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../database/index.js';
import { TimeEntry, CreateTimeEntryRequest, UpdateTimeEntryRequest } from '../types/index.js';
import { convertSecondsToCentesimal, convertMinutesToCentesimal } from '../utils/helpers.js';

/**
 * Obtener todos los registros de tiempo
 */
export async function getAllTimeEntries(req: Request, res: Response): Promise<void> {
  try {
    const db = getDb();
    const entries = await db.all<any[]>(
      'SELECT * FROM time_entries ORDER BY created_at DESC'
    );

    // Convertir nombres de columnas de snake_case a camelCase
    const formattedEntries = entries.map(e => ({
      id: e.id,
      projectId: e.project_id,
      startTime: e.start_time,
      endTime: e.end_time,
      duration: e.duration,
      durationCentesimal: e.duration_centesimal,
      description: e.description,
      createdAt: e.created_at,
    }));

    res.json(formattedEntries);
  } catch (error) {
    console.error('Error getting time entries:', error);
    res.status(500).json({ error: 'Error al obtener registros de tiempo' });
  }
}

/**
 * Obtener registros de tiempo por proyecto
 */
export async function getTimeEntriesByProject(req: Request, res: Response): Promise<void> {
  try {
    const { projectId } = req.params;
    const db = getDb();

    const entries = await db.all<any[]>(
      'SELECT * FROM time_entries WHERE project_id = ? ORDER BY created_at DESC',
      [projectId]
    );

    const formattedEntries = entries.map(e => ({
      id: e.id,
      projectId: e.project_id,
      startTime: e.start_time,
      endTime: e.end_time,
      duration: e.duration,
      durationCentesimal: e.duration_centesimal,
      description: e.description,
      createdAt: e.created_at,
    }));

    res.json(formattedEntries);
  } catch (error) {
    console.error('Error getting time entries by project:', error);
    res.status(500).json({ error: 'Error al obtener registros' });
  }
}

/**
 * Crear un nuevo registro de tiempo
 */
export async function createTimeEntry(req: Request, res: Response): Promise<void> {
  try {
    const {
      projectId,
      startTime,
      endTime,
      duration,
      durationCentesimal,
      description = ''
    } = req.body as CreateTimeEntryRequest;

    // Validación básica
    if (!projectId || !startTime || !endTime || duration === undefined) {
      res.status(400).json({ error: 'Parámetros requeridos faltantes' });
      return;
    }

    const db = getDb();

    // Verificar que el proyecto existe
    const project = await db.get(
      'SELECT id FROM projects WHERE id = ?',
      [projectId]
    );

    if (!project) {
      res.status(404).json({ error: 'Proyecto no encontrado' });
      return;
    }

    const id = uuidv4();
    const now = new Date().toISOString();

    await db.run(
      `INSERT INTO time_entries 
       (id, project_id, start_time, end_time, duration, duration_centesimal, description, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, projectId, startTime, endTime, duration, durationCentesimal, description, now]
    );

    const entry = await db.get<any>(
      'SELECT * FROM time_entries WHERE id = ?',
      [id]
    );

    res.status(201).json({
      id: entry.id,
      projectId: entry.project_id,
      startTime: entry.start_time,
      endTime: entry.end_time,
      duration: entry.duration,
      durationCentesimal: entry.duration_centesimal,
      description: entry.description,
      createdAt: entry.created_at,
    });
  } catch (error) {
    console.error('Error creating time entry:', error);
    res.status(500).json({ error: 'Error al crear registro de tiempo' });
  }
}

/**
 * Actualizar un registro de tiempo
 */
export async function updateTimeEntry(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { duration, durationCentesimal, description, endTime } = req.body as UpdateTimeEntryRequest;

    const db = getDb();
    const entry = await db.get<any>(
      'SELECT * FROM time_entries WHERE id = ?',
      [id]
    );

    if (!entry) {
      res.status(404).json({ error: 'Registro no encontrado' });
      return;
    }

    // Preparar valores actualizados
    let updateFields = [];
    let updateValues = [];

    if (duration !== undefined) {
      updateFields.push('duration = ?');
      updateValues.push(duration);
    }
    if (durationCentesimal !== undefined) {
      updateFields.push('duration_centesimal = ?');
      updateValues.push(durationCentesimal);
    }
    if (description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(description);
    }
    if (endTime !== undefined) {
      updateFields.push('end_time = ?');
      updateValues.push(endTime);
    }

    if (updateFields.length === 0) {
      res.status(400).json({ error: 'No hay campos para actualizar' });
      return;
    }

    updateValues.push(id);

    await db.run(
      `UPDATE time_entries SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    const updated = await db.get<any>(
      'SELECT * FROM time_entries WHERE id = ?',
      [id]
    );

    res.json({
      id: updated.id,
      projectId: updated.project_id,
      startTime: updated.start_time,
      endTime: updated.end_time,
      duration: updated.duration,
      durationCentesimal: updated.duration_centesimal,
      description: updated.description,
      createdAt: updated.created_at,
    });
  } catch (error) {
    console.error('Error updating time entry:', error);
    res.status(500).json({ error: 'Error al actualizar registro' });
  }
}

/**
 * Eliminar un registro de tiempo
 */
export async function deleteTimeEntry(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const db = getDb();

    const entry = await db.get(
      'SELECT id FROM time_entries WHERE id = ?',
      [id]
    );

    if (!entry) {
      res.status(404).json({ error: 'Registro no encontrado' });
      return;
    }

    await db.run('DELETE FROM time_entries WHERE id = ?', [id]);

    res.json({ message: 'Registro eliminado correctamente' });
  } catch (error) {
    console.error('Error deleting time entry:', error);
    res.status(500).json({ error: 'Error al eliminar registro' });
  }
}
