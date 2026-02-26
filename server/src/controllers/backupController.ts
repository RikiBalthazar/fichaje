import { Request, Response } from 'express';
import { getDb } from '../database/index.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

interface BackupData {
  version: string;
  exported_at: string;
  user_id: string;
  projects: any[];
  time_entries: any[];
  templates: any[];
  user_tags: any[];
  settings?: Record<string, any>;
}

/**
 * Exportar todos los datos del usuario como JSON
 */
export async function exportJSON(req: Request, res: Response): Promise<void> {
  try {
    const db = getDb();
    const userId = (req as AuthenticatedRequest).user.id;

    // Obtener todos los datos del usuario
    const projects = await db.all(
      'SELECT * FROM projects WHERE user_id = ? ORDER BY created_at ASC',
      [userId]
    );

    const timeEntries = await db.all(
      'SELECT * FROM time_entries WHERE user_id = ? ORDER BY created_at ASC',
      [userId]
    );

    const templates = await db.all(
      'SELECT * FROM description_templates WHERE user_id = ? ORDER BY order_index ASC',
      [userId]
    );

    const userTags = await db.all(
      'SELECT * FROM user_tags WHERE user_id = ? ORDER BY created_at ASC',
      [userId]
    );

    // Construir JSON con todos los datos
    const backupData: BackupData = {
      version: '1.0.0',
      exported_at: new Date().toISOString(),
      user_id: userId,
      projects: projects || [],
      time_entries: timeEntries || [],
      templates: templates || [],
      user_tags: userTags || [],
    };

    // Registrar acción en audit logs
    await logAudit(db, userId, 'export_data', {
      records_count: (projects?.length || 0) + (timeEntries?.length || 0) + (templates?.length || 0),
      timestamp: new Date().toISOString(),
    });

    // Enviar archivo JSON
    const filename = `backup-${new Date().toISOString().split('T')[0]}.json`;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.json(backupData);
  } catch (error) {
    console.error('Error exporting JSON:', error);
    res.status(500).json({ error: 'Error al exportar datos' });
  }
}

/**
 * Importar datos desde un JSON
 * Body: { data: BackupData, mode: 'replace' | 'merge' }
 */
export async function importJSON(req: Request, res: Response): Promise<void> {
  try {
    const db = getDb();
    const userId = (req as AuthenticatedRequest).user.id;
    const { data, mode = 'replace' } = req.body;

    if (!data || typeof data !== 'object') {
      res.status(400).json({ error: 'Formato de datos inválido' });
      return;
    }

    // Validar estructura JSON
    if (
      !Array.isArray(data.projects) ||
      !Array.isArray(data.time_entries) ||
      !Array.isArray(data.templates) ||
      !Array.isArray(data.user_tags)
    ) {
      res.status(400).json({ error: 'Estructura de backup inválida' });
      return;
    }

    // Iniciar transacción
    await db.exec('BEGIN TRANSACTION');

    try {
      if (mode === 'replace') {
        // Eliminar datos existentes
        await db.run('DELETE FROM time_entries WHERE user_id = ?', [userId]);
        await db.run('DELETE FROM projects WHERE user_id = ?', [userId]);
        await db.run('DELETE FROM description_templates WHERE user_id = ?', [userId]);
        await db.run('DELETE FROM user_tags WHERE user_id = ?', [userId]);
      }

      // Importar proyectos
      for (const project of data.projects) {
        const id = project.id || uuidv4();
        await db.run(
          `INSERT OR REPLACE INTO projects 
           (id, user_id, name, description, total_minutes, is_active, is_favorite, 
            last_used_at, tags, target_minutes, order_index, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            userId,
            project.name,
            project.description || null,
            project.total_minutes || 0,
            project.is_active ?? 1,
            project.is_favorite ?? 0,
            project.last_used_at || null,
            project.tags || '[]',
            project.target_minutes || null,
            project.order_index || 0,
            project.created_at || new Date().toISOString(),
            project.updated_at || new Date().toISOString(),
          ]
        );
      }

      // Importar time entries
      for (const entry of data.time_entries) {
        const id = entry.id || uuidv4();
        await db.run(
          `INSERT OR REPLACE INTO time_entries 
           (id, user_id, project_id, start_time, end_time, duration, duration_centesimal, description, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            userId,
            entry.project_id,
            entry.start_time,
            entry.end_time,
            entry.duration,
            entry.duration_centesimal,
            entry.description || null,
            entry.created_at || new Date().toISOString(),
          ]
        );
      }

      // Importar templates
      for (const template of data.templates) {
        const id = template.id || uuidv4();
        await db.run(
          `INSERT OR REPLACE INTO description_templates 
           (id, user_id, name, description, order_index, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            userId,
            template.name,
            template.description,
            template.order_index || 0,
            template.created_at || new Date().toISOString(),
            template.updated_at || new Date().toISOString(),
          ]
        );
      }

      // Importar tags
      for (const tag of data.user_tags) {
        const id = tag.id || uuidv4();
        await db.run(
          `INSERT OR REPLACE INTO user_tags 
           (id, user_id, name, color, created_at)
           VALUES (?, ?, ?, ?, ?)`,
          [
            id,
            userId,
            tag.name,
            tag.color,
            tag.created_at || new Date().toISOString(),
          ]
        );
      }

      // Confirmar transacción
      await db.exec('COMMIT');

      // Registrar acción en audit logs
      await logAudit(db, userId, 'import_data', {
        mode,
        projects_imported: data.projects?.length || 0,
        entries_imported: data.time_entries?.length || 0,
        templates_imported: data.templates?.length || 0,
        tags_imported: data.user_tags?.length || 0,
        timestamp: new Date().toISOString(),
      });

      res.json({
        success: true,
        message: `Se importaron ${data.projects?.length || 0} proyectos, ${data.time_entries?.length || 0} registros y ${data.templates?.length || 0} plantillas`,
      });
    } catch (error) {
      await db.exec('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error importing JSON:', error);
    res.status(500).json({ error: 'Error al importar datos' });
  }
}

/**
 * Obtener últimos logs de auditoría
 */
export async function getAuditLogs(req: Request, res: Response): Promise<void> {
  try {
    const db = getDb();
    const userId = (req as AuthenticatedRequest).user.id;
    const limit = parseInt(req.query.limit as string) || 50;

    const logs = await db.all(
      `SELECT id, action, timestamp, details 
       FROM audit_logs 
       WHERE user_id = ? 
       ORDER BY timestamp DESC 
       LIMIT ?`,
      [userId, limit]
    );

    res.json(logs || []);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: 'Error al obtener logs de auditoría' });
  }
}

/**
 * Registrar acción en audit logs
 */
export async function logAudit(
  db: any,
  userId: string,
  action: string,
  details?: Record<string, any>
): Promise<void> {
  try {
    const id = uuidv4();
    const timestamp = new Date().toISOString();

    await db.run(
      `INSERT INTO audit_logs (id, user_id, action, timestamp, details)
       VALUES (?, ?, ?, ?, ?)`,
      [id, userId, action, timestamp, details ? JSON.stringify(details) : null]
    );
  } catch (error) {
    console.error('Error logging audit:', error);
  }
}
