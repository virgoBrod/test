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
