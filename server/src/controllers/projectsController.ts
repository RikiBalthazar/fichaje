import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../database/index.js';
import { Project, CreateProjectRequest, UpdateProjectRequest } from '../types/index.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { calculateTotalMinutes } from '../utils/helpers.js';

/**
 * Obtener todos los proyectos
 */
export async function getAllProjects(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    const db = getDb();
    const projects = await db.all<any[]>(
      'SELECT * FROM projects WHERE user_id = ? AND is_active = 1 ORDER BY order_index ASC, created_at DESC',
      [userId]
    );
    
    // Calcular minutos totales actualizados para cada proyecto
    const projectsWithTotals = await Promise.all(
      projects.map(async (project) => {
        const entries = await db.all(
          'SELECT duration FROM time_entries WHERE user_id = ? AND project_id = ?',
          [userId, project.id]
        );
        const totalMinutes = calculateTotalMinutes(entries);
        return {
          ...project,
          totalMinutes,
          isActive: project.is_active,
          orderIndex: project.order_index,
          isFavorite: project.is_favorite ?? 0,
          lastUsedAt: project.last_used_at ?? null,
          tags: project.tags ?? '[]',
          createdAt: project.created_at,
          updatedAt: project.updated_at
        };
      })
    );

    res.json(projectsWithTotals);
  } catch (error) {
    console.error('Error getting projects:', error);
    res.status(500).json({ error: 'Error al obtener proyectos' });
  }
}

/**
 * Obtener todos los proyectos incluyendo inactivos (para administración)
 */
export async function getAllProjectsWithInactive(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    const db = getDb();
    const projects = await db.all<any[]>(
      'SELECT * FROM projects WHERE user_id = ? ORDER BY order_index ASC, created_at DESC',
      [userId]
    );
    
    // Calcular minutos totales actualizados para cada proyecto
    const projectsWithTotals = await Promise.all(
      projects.map(async (project) => {
        const entries = await db.all(
          'SELECT duration FROM time_entries WHERE user_id = ? AND project_id = ?',
          [userId, project.id]
        );
        const totalMinutes = calculateTotalMinutes(entries);
        return {
          ...project,
          totalMinutes,
          isActive: project.is_active,
          orderIndex: project.order_index,
          isFavorite: project.is_favorite ?? 0,
          lastUsedAt: project.last_used_at ?? null,
          tags: project.tags ?? '[]',
          createdAt: project.created_at,
          updatedAt: project.updated_at
        };
      })
    );

    res.json(projectsWithTotals);
  } catch (error) {
    console.error('Error getting projects:', error);
    res.status(500).json({ error: 'Error al obtener proyectos' });
  }
}

/**
 * Obtener un proyecto por ID
 */
export async function getProjectById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = (req as AuthenticatedRequest).user.id;
    const db = getDb();
    const project = await db.get<Project>(
      'SELECT * FROM projects WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (!project) {
      res.status(404).json({ error: 'Proyecto no encontrado' });
      return;
    }

    const entries = await db.all(
      'SELECT duration FROM time_entries WHERE user_id = ? AND project_id = ?',
      [userId, id]
    );
    const totalMinutes = calculateTotalMinutes(entries);

    res.json({ ...project, totalMinutes });
  } catch (error) {
    console.error('Error getting project:', error);
    res.status(500).json({ error: 'Error al obtener proyecto' });
  }
}

/**
 * Crear un nuevo proyecto
 */
export async function createProject(req: Request, res: Response): Promise<void> {
  try {
    const { name, description = '', tags = [] } = req.body as CreateProjectRequest;
    const userId = (req as AuthenticatedRequest).user.id;

    if (!name || !name.trim()) {
      res.status(400).json({ error: 'El nombre del proyecto es requerido' });
      return;
    }

    const id = uuidv4();
    const now = new Date().toISOString();
    const db = getDb();
    const tagsJSON = JSON.stringify(tags);

    await db.run(
      'INSERT INTO projects (id, user_id, name, description, tags, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, userId, name.trim(), description.trim(), tagsJSON, now, now]
    );

    const project = await db.get<Project>(
      'SELECT * FROM projects WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    res.status(201).json({ ...project, totalMinutes: 0, tags: project?.tags ?? '[]' });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Error al crear proyecto' });
  }
}

/**
 * Actualizar un proyecto
 */
export async function updateProject(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { name, description } = req.body as UpdateProjectRequest;
    const userId = (req as AuthenticatedRequest).user.id;
    const db = getDb();

    const project = await db.get<Project>(
      'SELECT * FROM projects WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (!project) {
      res.status(404).json({ error: 'Proyecto no encontrado' });
      return;
    }

    const now = new Date().toISOString();
    await db.run(
      'UPDATE projects SET name = ?, description = ?, updated_at = ? WHERE id = ? AND user_id = ?',
      [name || project.name, description !== undefined ? description : project.description, now, id, userId]
    );

    const updated = await db.get<Project>(
      'SELECT * FROM projects WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    const entries = await db.all(
      'SELECT duration FROM time_entries WHERE user_id = ? AND project_id = ?',
      [userId, id]
    );
    const totalMinutes = calculateTotalMinutes(entries);

    res.json({ ...updated, totalMinutes });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Error al actualizar proyecto' });
  }
}

/**
 * Eliminar un proyecto
 */
export async function deleteProject(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = (req as AuthenticatedRequest).user.id;
    const db = getDb();

    const project = await db.get<Project>(
      'SELECT * FROM projects WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (!project) {
      res.status(404).json({ error: 'Proyecto no encontrado' });
      return;
    }

    // Eliminar también todos los time entries asociados (por cascada)
    await db.run('DELETE FROM projects WHERE id = ? AND user_id = ?', [id, userId]);

    res.json({ message: 'Proyecto eliminado correctamente' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Error al eliminar proyecto' });
  }
}

/**
 * Actualizar orden de proyectos
 */
export async function updateProjectsOrder(req: Request, res: Response): Promise<void> {
  try {
    const { projects } = req.body;
    const userId = (req as AuthenticatedRequest).user.id;
    
    if (!Array.isArray(projects)) {
      res.status(400).json({ error: 'projects debe ser un array' });
      return;
    }

    const db = getDb();

    // Actualizar order_index para cada proyecto
    for (let i = 0; i < projects.length; i++) {
      await db.run(
        'UPDATE projects SET order_index = ? WHERE id = ? AND user_id = ?',
        [i, projects[i].id, userId]
      );
    }

    res.json({ message: 'Orden actualizado correctamente' });
  } catch (error) {
    console.error('Error updating projects order:', error);
    res.status(500).json({ error: 'Error al actualizar orden' });
  }
}

/**
 * Toggle is_active de un proyecto (ocultar/mostrar)
 */
export async function toggleProjectActive(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = (req as AuthenticatedRequest).user.id;
    const db = getDb();

    const project = await db.get<any>(
      'SELECT * FROM projects WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (!project) {
      res.status(404).json({ error: 'Proyecto no encontrado' });
      return;
    }

    // Toggle is_active
    const newIsActive = project.is_active === 1 ? 0 : 1;
    const updatedAt = new Date().toISOString();

    await db.run(
      'UPDATE projects SET is_active = ?, updated_at = ? WHERE id = ? AND user_id = ?',
      [newIsActive, updatedAt, id, userId]
    );

    const updated = await db.get<any>(
      'SELECT * FROM projects WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    const entries = await db.all(
      'SELECT duration FROM time_entries WHERE user_id = ? AND project_id = ?',
      [userId, id]
    );
    const totalMinutes = calculateTotalMinutes(entries);

    res.json({
      ...updated,
      totalMinutes,
      isActive: updated.is_active,
      orderIndex: updated.order_index,
      isFavorite: updated.is_favorite ?? 0,
      lastUsedAt: updated.last_used_at ?? null,
      createdAt: updated.created_at,
      updatedAt: updated.updated_at
    });
  } catch (error) {
    console.error('Error toggling project active:', error);
    res.status(500).json({ error: 'Error al cambiar estado del proyecto' });
  }
}

/**
 * Toggle is_favorite de un proyecto
 */
export async function toggleProjectFavorite(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = (req as AuthenticatedRequest).user.id;
    const db = getDb();

    const project = await db.get<any>(
      'SELECT * FROM projects WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (!project) {
      res.status(404).json({ error: 'Proyecto no encontrado' });
      return;
    }

    // Toggle is_favorite
    const newIsFavorite = (project.is_favorite ?? 0) === 1 ? 0 : 1;
    const updatedAt = new Date().toISOString();

    await db.run(
      'UPDATE projects SET is_favorite = ?, updated_at = ? WHERE id = ? AND user_id = ?',
      [newIsFavorite, updatedAt, id, userId]
    );

    const updated = await db.get<any>(
      'SELECT * FROM projects WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    const entries = await db.all(
      'SELECT duration FROM time_entries WHERE user_id = ? AND project_id = ?',
      [userId, id]
    );
    const totalMinutes = calculateTotalMinutes(entries);

    res.json({
      ...updated,
      totalMinutes,
      isActive: updated.is_active,
      orderIndex: updated.order_index,
      isFavorite: updated.is_favorite ?? 0,
      lastUsedAt: updated.last_used_at ?? null,
      tags: updated.tags ?? '[]',
      createdAt: updated.created_at,
      updatedAt: updated.updated_at
    });
  } catch (error) {
    console.error('Error toggling project favorite:', error);
    res.status(500).json({ error: 'Error al cambiar favorito del proyecto' });
  }
}

/**
 * Actualizar tags de un proyecto
 */
export async function updateProjectTags(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { tags } = req.body as { tags: string[] };
    const userId = (req as AuthenticatedRequest).user.id;
    const db = getDb();

    const project = await db.get<Project>(
      'SELECT * FROM projects WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (!project) {
      res.status(404).json({ error: 'Proyecto no encontrado' });
      return;
    }

    const tagsJSON = JSON.stringify(tags || []);
    const timestamp = new Date().toISOString();

    await db.run(
      'UPDATE projects SET tags = ?, updated_at = ? WHERE id = ? AND user_id = ?',
      [tagsJSON, timestamp, id, userId]
    );

    const updated = await db.get(
      'SELECT * FROM projects WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    const entries = await db.all(
      'SELECT duration FROM time_entries WHERE user_id = ? AND project_id = ?',
      [userId, id]
    );
    const totalMinutes = calculateTotalMinutes(entries);

    res.json({
      ...updated,
      totalMinutes,
      isActive: updated!.is_active,
      orderIndex: updated!.order_index,
      isFavorite: updated!.is_favorite ?? 0,
      lastUsedAt: updated!.last_used_at ?? null,
      tags: updated!.tags ?? '[]',
      createdAt: updated!.created_at,
      updatedAt: updated!.updated_at
    });
  } catch (error) {
    console.error('Error updating project tags:', error);
    res.status(500).json({ error: 'Error al actualizar tags del proyecto' });
  }
}
