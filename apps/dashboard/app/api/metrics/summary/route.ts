import { initDb, db } from "@/lib/db";

export async function GET() {
  await initDb();

  const result = await db.execute({
    sql: `SELECT
            COUNT(*) as total,
            COUNT(CASE WHEN status = 'passed' THEN 1 END) as passed,
            COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed
          FROM executions
          WHERE status IN ('passed', 'failed')`,
  });

  const row = result.rows[0];
  const total = Number(row.total);
  const passed = Number(row.passed);
  const failed = Number(row.failed);
  const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;

  return Response.json({ total, passed, failed, passRate });
}
