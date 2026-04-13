import { initDb, db } from "@/lib/db";
import path from "path";
import fs from "fs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  await initDb();

  const { id } = await params;

  const [execution, results] = await Promise.all([
    db.execute({
      sql: `SELECT * FROM executions WHERE id = ?`,
      args: [id],
    }),
    db.execute({
      sql: `SELECT * FROM results WHERE execution_id = ? ORDER BY id ASC`,
      args: [id],
    }),
  ]);

  if (!execution.rows.length) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const parsedResults = results.rows.map((r) => ({
    ...r,
    assertions: JSON.parse((r.assertions as string) ?? "[]"),
    passed: r.passed === 1,
  }));

  return Response.json({
    execution: execution.rows[0],
    results: parsedResults,
  });
}
