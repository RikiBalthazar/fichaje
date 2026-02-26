import { Request, Response } from 'express';
import { getDb } from '../database/index.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export async function getDashboardStats(req: Request, res: Response) {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    const db = getDb();
    const { days = 7 } = req.query;

    const daysNumber = parseInt(days as string, 10);
    const now = new Date();
    const startDate = new Date(now.getTime() - daysNumber * 24 * 60 * 60 * 1000);

    // Obtener entradas del período
    const entries = await db.all(
      `SELECT te.*, p.name as projectName 
       FROM time_entries te 
       LEFT JOIN projects p ON te.project_id = p.id 
       WHERE te.user_id = ? AND te.created_at >= ? 
       ORDER BY te.created_at ASC`,
      [userId, startDate.toISOString()]
    );

    // Proyectos con última actividad
    const projects = await db.all(
      `SELECT p.*, 
              MAX(te.created_at) as last_activity,
              SUM(te.duration) as total_duration
       FROM projects p
       LEFT JOIN time_entries te ON p.id = te.project_id AND te.user_id = p.user_id
       WHERE p.user_id = ? AND p.is_active = 1
       GROUP BY p.id
       ORDER BY last_activity DESC`,
      [userId]
    );

    // Procesamiento de datos
    const stats = {
      entries,
      projects,
      summary: {
        totalSeconds: entries.reduce((sum: number, e: any) => sum + e.duration, 0),
        totalEntries: entries.length,
        uniqueProjects: new Set(entries.map((e: any) => e.project_id)).size,
      },
    };

    res.json(stats);
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
}
