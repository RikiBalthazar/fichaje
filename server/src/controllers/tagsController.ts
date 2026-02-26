import { Request, Response } from 'express';
import { getDb } from '../database/index.js';
import { v4 as uuidv4 } from 'uuid';

// GET /api/tags - Obtener todos los tags del usuario
export async function getAllTags(req: Request, res: Response) {
  try {
    const db = getDb();
    const userId = (req as any).userId;

    const tags = await db.all(
      'SELECT id, name, color, created_at as createdAt FROM user_tags WHERE user_id = ? ORDER BY name ASC',
      [userId]
    );

    res.json(tags);
  } catch (error) {
    console.error('Error al obtener tags:', error);
    res.status(500).json({ error: 'Error al obtener tags' });
  }
}

// POST /api/tags - Crear un nuevo tag
export async function createTag(req: Request, res: Response) {
  try {
    const db = getDb();
    const userId = (req as any).userId;
    const { name, color } = req.body;

    if (!name || !color) {
      return res.status(400).json({ error: 'Nombre y color son requeridos' });
    }

    // Verificar si ya existe un tag con ese nombre para este usuario
    const existing = await db.get(
      'SELECT id FROM user_tags WHERE user_id = ? AND name = ?',
      [userId, name]
    );

    if (existing) {
      return res.status(400).json({ error: 'Ya existe un tag con ese nombre' });
    }

    const id = uuidv4();
    const now = new Date().toISOString();

    await db.run(
      'INSERT INTO user_tags (id, user_id, name, color, created_at) VALUES (?, ?, ?, ?, ?)',
      [id, userId, name, color, now]
    );

    const tag = await db.get(
      'SELECT id, name, color, created_at as createdAt FROM user_tags WHERE id = ?',
      [id]
    );

    res.status(201).json(tag);
  } catch (error) {
    console.error('Error al crear tag:', error);
    res.status(500).json({ error: 'Error al crear tag' });
  }
}

// PUT /api/tags/:id - Actualizar un tag
export async function updateTag(req: Request, res: Response) {
  try {
    const db = getDb();
    const userId = (req as any).userId;
    const { id } = req.params;
    const { name, color } = req.body;

    if (!name || !color) {
      return res.status(400).json({ error: 'Nombre y color son requeridos' });
    }

    // Verificar que el tag pertenece al usuario
    const tag = await db.get(
      'SELECT id FROM user_tags WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (!tag) {
      return res.status(404).json({ error: 'Tag no encontrado' });
    }

    // Verificar si ya existe otro tag con ese nombre para este usuario
    const existing = await db.get(
      'SELECT id FROM user_tags WHERE user_id = ? AND name = ? AND id != ?',
      [userId, name, id]
    );

    if (existing) {
      return res.status(400).json({ error: 'Ya existe un tag con ese nombre' });
    }

    await db.run(
      'UPDATE user_tags SET name = ?, color = ? WHERE id = ? AND user_id = ?',
      [name, color, id, userId]
    );

    const updatedTag = await db.get(
      'SELECT id, name, color, created_at as createdAt FROM user_tags WHERE id = ?',
      [id]
    );

    res.json(updatedTag);
  } catch (error) {
    console.error('Error al actualizar tag:', error);
    res.status(500).json({ error: 'Error al actualizar tag' });
  }
}

// DELETE /api/tags/:id - Eliminar un tag
export async function deleteTag(req: Request, res: Response) {
  try {
    const db = getDb();
    const userId = (req as any).userId;
    const { id } = req.params;

    // Verificar que el tag pertenece al usuario
    const tag = await db.get(
      'SELECT id FROM user_tags WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (!tag) {
      return res.status(404).json({ error: 'Tag no encontrado' });
    }

    await db.run(
      'DELETE FROM user_tags WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar tag:', error);
    res.status(500).json({ error: 'Error al eliminar tag' });
  }
}
