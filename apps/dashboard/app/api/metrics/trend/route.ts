import { initDb, db } from "@/lib/db";

export async function GET(req: Request) {
  await initDb();
  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") ?? "week";

  let sql: string;
  let args: (string | number)[];

  if (period === "today") {
    sql = `
      SELECT
        strftime('%H:00', started_at) as date,
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'passed' THEN 1 END) as passed,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed
      FROM executions
      WHERE status IN ('passed', 'failed')
        AND started_at >= datetime('now', '-24 hours')
      GROUP BY strftime('%H:00', started_at)
      ORDER BY date ASC
    `;
    args = [];
  } else if (period === "week") {
    sql = `
      SELECT
        date(started_at) as date,
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'passed' THEN 1 END) as passed,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed
      FROM executions
      WHERE status IN ('passed', 'failed')
        AND started_at >= datetime('now', '-7 days')
      GROUP BY date(started_at)
      ORDER BY date ASC
    `;
    args = [];
  } else {
    sql = `
      SELECT
        date(started_at) as date,
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'passed' THEN 1 END) as passed,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed
      FROM executions
      WHERE status IN ('passed', 'failed')
        AND started_at >= datetime('now', '-30 days')
      GROUP BY date(started_at)
      ORDER BY date ASC
    `;
    args = [];
  }

  const result = await db.execute({ sql, args });
  return Response.json(result.rows);
}
