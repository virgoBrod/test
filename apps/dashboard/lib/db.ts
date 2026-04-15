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
      duration_ms INTEGER DEFAULT 0,
      project_id TEXT
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

  await db.execute(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      base_url_mobile TEXT NOT NULL,
      base_url_web TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS credentials (
      project_id TEXT PRIMARY KEY,
      encrypted_data TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (project_id) REFERENCES projects(id)
    )
  `);

  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_executions_project ON executions(project_id)
  `).catch(() => {
    // Index may fail if column doesn't exist yet
  });

  const projects = [
    { id: "lv", name: "LV", base_url_mobile: "", base_url_web: "https://lv.inovisec.com/lv/" },
    { id: "medellin", name: "Medellín", base_url_mobile: "https://medellin.broadsec.com", base_url_web: "https://medellin.broadsec.com" },
    { id: "movilidad_medellin", name: "Movilidad Medellín", base_url_mobile: "https://movilidad.broadsec.com", base_url_web: "https://movilidad.broadsec.com" },
    { id: "sales", name: "SALES", base_url_mobile: "https://mb.inovisec.com", base_url_web: "https://web.inovisec.com" },
  ];

  for (const p of projects) {
    try {
      await db.execute({
        sql: `INSERT OR IGNORE INTO projects (id, name, base_url_mobile, base_url_web) VALUES (?, ?, ?, ?)`,
        args: [p.id, p.name, p.base_url_mobile, p.base_url_web],
      });
    } catch {
      // ignore
    }
  }

  try {
    await db.execute(`ALTER TABLE results ADD COLUMN response_body TEXT`);
  } catch {
    // La columna ya existe
  }

  try {
    await db.execute(`ALTER TABLE executions ADD COLUMN project_id TEXT`);
  } catch {
    // La columna ya existe
  }
}
