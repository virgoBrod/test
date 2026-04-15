import { NextRequest } from "next/server";
import { initDb, db } from "@/lib/db";
import path from "path";
import fs from "fs";

export async function GET(req: NextRequest) {
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  await initDb();

  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get("limit") ?? 20);
  const projectId = searchParams.get("project_id");
  const collection = searchParams.get("collection");

  let sql = `SELECT * FROM executions`;
  const args: (string | number)[] = [];
  const conditions: string[] = [];

  if (projectId) {
    conditions.push(`project_id = ?`);
    args.push(projectId);
  }

  if (collection) {
    conditions.push(`collection = ?`);
    args.push(collection);
  }

  if (conditions.length > 0) {
    sql += ` WHERE ` + conditions.join(` AND `);
  }

  sql += ` ORDER BY started_at DESC LIMIT ?`;
  args.push(limit);

  const rows = await db.execute({ sql, args });

  return Response.json(rows.rows);
}
