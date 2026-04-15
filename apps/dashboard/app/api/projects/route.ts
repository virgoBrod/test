import { NextRequest } from "next/server";
import { initDb, db } from "@/lib/db";

export async function GET() {
  await initDb();
  const rows = await db.execute({ sql: `SELECT * FROM projects ORDER BY name` });
  return Response.json(rows.rows);
}

export async function POST(req: NextRequest) {
  await initDb();
  const body = await req.json();
  const { id, name, base_url_mobile, base_url_web } = body;

  if (!id || !name || !base_url_mobile || !base_url_web) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    await db.execute({
      sql: `INSERT INTO projects (id, name, base_url_mobile, base_url_web) VALUES (?, ?, ?, ?)`,
      args: [id, name, base_url_mobile, base_url_web],
    });
    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Project already exists" }, { status: 409 });
  }
}
