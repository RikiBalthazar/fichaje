import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'data.db');

let db: Database | null = null;

export async function initDb(): Promise<Database> {
  if (db) return db;

  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Habilitar foreign keys
  await db.exec('PRAGMA foreign_keys = ON');

  // Crear tablas
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      name TEXT NOT NULL,
      description TEXT,
      total_minutes INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      order_index INTEGER DEFAULT 0,
      target_minutes INTEGER DEFAULT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS time_entries (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      project_id TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      duration INTEGER NOT NULL,
      duration_centesimal TEXT NOT NULL,
      description TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS description_templates (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      order_index INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS project_timers (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      project_id TEXT NOT NULL,
      accumulated_seconds INTEGER DEFAULT 0,
      started_at TEXT,
      is_running INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE (user_id, project_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_time_entries_project_id 
      ON time_entries(project_id);
    
    CREATE INDEX IF NOT EXISTS idx_time_entries_created_at 
      ON time_entries(created_at);

    CREATE INDEX IF NOT EXISTS idx_projects_user_id
      ON projects(user_id);

    CREATE INDEX IF NOT EXISTS idx_time_entries_user_id
      ON time_entries(user_id);

    CREATE INDEX IF NOT EXISTS idx_templates_user_id
      ON description_templates(user_id);

    CREATE INDEX IF NOT EXISTS idx_project_timers_user_id
      ON project_timers(user_id);
  `);

  // Migrations: agregar columnas si no existen
  try {
    await db.exec('ALTER TABLE projects ADD COLUMN is_active INTEGER DEFAULT 1');
  } catch (e) {
    // Column already exists
  }

  try {
    await db.exec('ALTER TABLE projects ADD COLUMN order_index INTEGER DEFAULT 0');
  } catch (e) {
    // Column already exists
  }

  try {
    await db.exec('ALTER TABLE projects ADD COLUMN user_id TEXT');
  } catch (e) {
    // Column already exists
  }

  try {
    await db.exec('ALTER TABLE time_entries ADD COLUMN user_id TEXT');
  } catch (e) {
    // Column already exists
  }

  try {
    await db.exec('ALTER TABLE description_templates ADD COLUMN user_id TEXT');
  } catch (e) {
    // Column already exists
  }

  // Migration: agregar columna is_favorite para marcar proyectos favoritos
  try {
    await db.exec('ALTER TABLE projects ADD COLUMN is_favorite INTEGER DEFAULT 0');
  } catch (e) {
    // Column already exists
  }

  // Migration: agregar columna last_used_at para rastrear proyectos recientes
  try {
    await db.exec('ALTER TABLE projects ADD COLUMN last_used_at TEXT');
  } catch (e) {
    // Column already exists
  }

  // Migration: agregar columna tags para clasificar proyectos con etiquetas
  try {
    await db.exec('ALTER TABLE projects ADD COLUMN tags TEXT DEFAULT "[]"');
  } catch (e) {
    // Column already exists
  }

  // Migration: agregar columna target_minutes para limite de tiempo por proyecto
  try {
    await db.exec('ALTER TABLE projects ADD COLUMN target_minutes INTEGER DEFAULT NULL');
  } catch (e) {
    // Column already exists
  }

  // Crear tabla user_tags para tags personalizados
  await db.exec(`
    CREATE TABLE IF NOT EXISTS user_tags (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      color TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_user_tags_user_id
      ON user_tags(user_id);
  `);

  console.log('✅ Database initialized');
  return db;
}

export function getDb(): Database {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
}

export async function closeDb(): Promise<void> {
  if (db) {
    await db.close();
    db = null;
  }
}
