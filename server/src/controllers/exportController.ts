import { Request, Response } from 'express';
import { getDb } from '../database/index.js';
import { generateExportContent } from '../utils/helpers.js';

/**
 * Exportar datos a TXT
 * Query params:
 *   - projectId: Filtrar por proyecto específico
 *   - dateFrom: Fecha mínima (YYYY-MM-DD)
 *   - dateTo: Fecha máxima (YYYY-MM-DD)
 */
export async function exportToTxt(req: Request, res: Response): Promise<void> {
  try {
    const db = getDb();
    const { projectId, dateFrom, dateTo } = req.query as Record<string, string>;

    // Obtener todos los proyectos
    const projects = await db.all('SELECT id, name FROM projects');

    // Construir query con filtros
    let query = 'SELECT * FROM time_entries WHERE 1=1';
    const params: any[] = [];

    if (projectId) {
      query += ' AND project_id = ?';
      params.push(projectId);
    }

    if (dateFrom) {
      query += ' AND DATE(created_at) >= ?';
      params.push(dateFrom);
    }

    if (dateTo) {
      query += ' AND DATE(created_at) <= ?';
      params.push(dateTo);
    }

    query += ' ORDER BY created_at ASC';

    // Obtener registros de tiempo filtrados
    const entries = await db.all(query, params);

    // Generar contenido
    const content = generateExportContent(entries, projects);

    // Enviar como texto
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.json({ content });
  } catch (error) {
    console.error('Error exporting:', error);
    res.status(500).json({ error: 'Error al exportar datos' });
  }
}
