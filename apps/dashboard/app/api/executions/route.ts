import { NextRequest } from "next/server";
import { initDb, db } from "@/lib/db";
import path from "path";
import fs from "fs";

export async function GET(req: NextRequest) {
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  await initDb();

  const { searchParams } = new URL(req.url);
  
  // Validar y clamping de limit/offset para prevenir abusos
  const rawLimit = Number(searchParams.get("limit"));
  const rawOffset = Number(searchParams.get("offset"));
  const limit = isNaN(rawLimit) ? 20 : Math.min(Math.max(rawLimit, 1), 100);
  const offset = isNaN(rawOffset) ? 0 : Math.max(rawOffset, 0);
  
  const projectId = searchParams.get("project_id");
  const collection = searchParams.get("collection");
  const status = searchParams.get("status");

  let sql = `SELECT * FROM executions`;
  let countSql = `SELECT COUNT(*) as total FROM executions`;
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

  if (status && status !== "all") {
    conditions.push(`status = ?`);
    args.push(status);
  }

  const whereClause = conditions.length > 0 ? ` WHERE ` + conditions.join(` AND `) : ``;
  sql += whereClause + ` ORDER BY started_at DESC LIMIT ? OFFSET ?`;
  countSql += whereClause;

  const countResult = await db.execute({ sql: countSql, args });
  const total = Number((countResult.rows[0] as unknown as { total: number }).total);

  const rows = await db.execute({ sql, args: [...args, limit, offset] });

  return Response.json({
    executions: rows.rows,
    total,
    limit,
    offset,
  });
}
