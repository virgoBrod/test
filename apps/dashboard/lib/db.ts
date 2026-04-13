import { createClient } from "@libsql/client";
import path from "path";
import fs from "fs";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "dashboard.db");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export const db = createClient({ url: `file:${DB_PATH}` });

export async function initDb() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS executions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      collection TEXT NOT NULL,
      environment TEXT NOT NULL,
      started_at TEXT NOT NULL,
      finished_at TEXT,
      status TEXT NOT NULL DEFAULT 'running',
      total INTEGER DEFAULT 0,
      passed INTEGER DEFAULT 0,
      failed INTEGER DEFAULT 0,
      duration_ms INTEGER DEFAULT 0
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      execution_id INTEGER NOT NULL,
      request_name TEXT NOT NULL,
      url TEXT NOT NULL,
      method TEXT NOT NULL,
      status_code INTEGER,
      duration_ms INTEGER DEFAULT 0,
      passed INTEGER DEFAULT 1,
      assertions TEXT DEFAULT '[]',
      error TEXT,
      response_body TEXT,
      FOREIGN KEY (execution_id) REFERENCES executions(id)
    )
  `);

  // Migración: agrega response_body si la tabla ya existía sin esa columna
  try {
    await db.execute(`ALTER TABLE results ADD COLUMN response_body TEXT`);
  } catch {
    // La columna ya existe — ignoramos el error
  }
}
