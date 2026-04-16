import { NextRequest } from "next/server";
import { initDb, db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await initDb();
  const { id } = await params;

  const result = await db.execute({
    sql: `SELECT * FROM projects WHERE id = ?`,
    args: [id],
  });

  if (!result.rows.length) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }

  return Response.json(result.rows[0]);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await initDb();
  const { id } = await params;
  const body = await req.json();
  const { name, base_url_mobile, base_url_web } = body;

  if (!name || !base_url_mobile || !base_url_web) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  await db.execute({
    sql: `UPDATE projects SET name = ?, base_url_mobile = ?, base_url_web = ? WHERE id = ?`,
    args: [name, base_url_mobile, base_url_web, id],
  });

  return Response.json({ success: true });
}
