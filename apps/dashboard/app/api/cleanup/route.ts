import { NextRequest, NextResponse } from "next/server";
import { initDb, cleanupOldData } from "@/lib/db";

/**
 * POST /api/cleanup
 * Limpia ejecuciones y resultados mayores a X días.
 * Body: { retentionDays?: number } (default: 30)
 */
export async function POST(req: NextRequest) {
  try {
    await initDb();

    const body = await req.json().catch(() => ({}));
    const retentionDays = body.retentionDays || 30;

    // Validar que retentionDays sea un número razonable
    if (typeof retentionDays !== "number" || retentionDays < 1 || retentionDays > 365) {
      return NextResponse.json(
        { error: "retentionDays must be between 1 and 365" },
        { status: 400 }
      );
    }

    const result = await cleanupOldData(retentionDays);

    return NextResponse.json({
      success: true,
      message: `Cleaned up data older than ${retentionDays} days`,
      deletedExecutions: result.deletedExecutions,
      deletedResults: result.deletedResults,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
