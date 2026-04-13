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

  const rows = await db.execute({
    sql: `SELECT * FROM executions ORDER BY started_at DESC LIMIT ?`,
    args: [limit],
  });

  return Response.json(rows.rows);
}
