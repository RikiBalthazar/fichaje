import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../database/index.js';
import { DescriptionTemplate, CreateDescriptionTemplateRequest, UpdateDescriptionTemplateRequest } from '../types/index.js';

/**
 * Obtener todas las plantillas de descripción
 */
export async function getAllTemplates(req: Request, res: Response): Promise<void> {
  try {
    const db = getDb();
    const templates = await db.all<DescriptionTemplate[]>(
      'SELECT * FROM description_templates ORDER BY order_index ASC, created_at DESC'
    );
    res.json(templates);
  } catch (error) {
    console.error('Error getting templates:', error);
    res.status(500).json({ error: 'Error al obtener plantillas' });
  }
}

/**
 * Obtener una plantilla por ID
 */
export async function getTemplateById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const db = getDb();
    const template = await db.get<DescriptionTemplate>(
      'SELECT * FROM description_templates WHERE id = ?',
      [id]
    );

    if (!template) {
      res.status(404).json({ error: 'Plantilla no encontrada' });
      return;
    }

    res.json(template);
  } catch (error) {
    console.error('Error getting template:', error);
    res.status(500).json({ error: 'Error al obtener plantilla' });
  }
}

/**
 * Crear nueva plantilla de descripción
 */
export async function createTemplate(req: Request, res: Response): Promise<void> {
  try {
    const { name, description } = req.body as CreateDescriptionTemplateRequest;

    if (!name || !description) {
      res.status(400).json({ error: 'Nombre y descripción son requeridos' });
      return;
    }

    const db = getDb();
    const id = uuidv4();
    const createdAt = new Date().toISOString();

    // Obtener el máximo order_index
    const maxOrder = await db.get<{ max_order: number }>(
      'SELECT MAX(order_index) as max_order FROM description_templates'
    );
    const orderIndex = (maxOrder?.max_order ?? -1) + 1;

    await db.run(
      'INSERT INTO description_templates (id, name, description, order_index, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      [id, name, description, orderIndex, createdAt, createdAt]
    );

    const template = await db.get<DescriptionTemplate>(
      'SELECT * FROM description_templates WHERE id = ?',
      [id]
    );

    res.status(201).json(template);
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ error: 'Error al crear plantilla' });
  }
}

/**
 * Actualizar plantilla de descripción
 */
export async function updateTemplate(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { name, description } = req.body as UpdateDescriptionTemplateRequest;

    const db = getDb();
    const template = await db.get<DescriptionTemplate>(
      'SELECT * FROM description_templates WHERE id = ?',
      [id]
    );

    if (!template) {
      res.status(404).json({ error: 'Plantilla no encontrada' });
      return;
    }

    const updatedAt = new Date().toISOString();
    const newName = name ?? template.name;
    const newDescription = description ?? template.description;

    await db.run(
      'UPDATE description_templates SET name = ?, description = ?, updated_at = ? WHERE id = ?',
      [newName, newDescription, updatedAt, id]
    );

    const updated = await db.get<DescriptionTemplate>(
      'SELECT * FROM description_templates WHERE id = ?',
      [id]
    );

    res.json(updated);
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({ error: 'Error al actualizar plantilla' });
  }
}

/**
 * Eliminar plantilla de descripción
 */
export async function deleteTemplate(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const db = getDb();

    const template = await db.get<DescriptionTemplate>(
      'SELECT * FROM description_templates WHERE id = ?',
      [id]
    );

    if (!template) {
      res.status(404).json({ error: 'Plantilla no encontrada' });
      return;
    }

    await db.run('DELETE FROM description_templates WHERE id = ?', [id]);
    res.json({ message: 'Plantilla eliminada correctamente' });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ error: 'Error al eliminar plantilla' });
  }
}

/**
 * Actualizar orden de plantillas
 */
export async function updateTemplatesOrder(req: Request, res: Response): Promise<void> {
  try {
    const { templates } = req.body;

    if (!Array.isArray(templates)) {
      res.status(400).json({ error: 'templates debe ser un array' });
      return;
    }

    const db = getDb();

    for (let i = 0; i < templates.length; i++) {
      await db.run(
        'UPDATE description_templates SET order_index = ? WHERE id = ?',
        [i, templates[i].id]
      );
    }

    res.json({ message: 'Orden actualizado correctamente' });
  } catch (error) {
    console.error('Error updating templates order:', error);
    res.status(500).json({ error: 'Error al actualizar orden' });
  }
}
