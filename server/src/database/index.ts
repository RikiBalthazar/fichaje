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
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      total_minutes INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      order_index INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS time_entries (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      duration INTEGER NOT NULL,
      duration_centesimal TEXT NOT NULL,
      description TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS description_templates (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      order_index INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_time_entries_project_id 
      ON time_entries(project_id);
    
    CREATE INDEX IF NOT EXISTS idx_time_entries_created_at 
      ON time_entries(created_at);
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
