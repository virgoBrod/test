import { NextRequest } from "next/server";
import { initDb, db } from "@/lib/db";

export async function POST(req: NextRequest) {
  await initDb();
  const body = await req.json();
  const { project_id, user_identifier } = body;

  if (!project_id || !user_identifier) {
    return Response.json(
      { success: false, message: "Missing project_id or user_identifier" },
      { status: 400 }
    );
  }

  const projectResult = await db.execute({
    sql: `SELECT base_url_mobile FROM projects WHERE id = ?`,
    args: [project_id],
  });

  if (!projectResult.rows.length) {
    return Response.json(
      { success: false, message: "Project not found" },
      { status: 404 }
    );
  }

  const baseUrl = projectResult.rows[0].base_url_mobile as string;

  try {
    const response = await fetch(`${baseUrl}/api/auth/force-logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_identifier }),
    });

    if (response.ok) {
      return Response.json({ success: true, message: "Sesión cerrada exitosamente" });
    } else {
      const errorData = await response.json().catch(() => ({}));
      return Response.json({
        success: false,
        message: errorData.message || "Error al cerrar sesión",
      }, { status: response.status });
    }
  } catch {
    return Response.json({
      success: false,
      message: "No se pudo conectar al servidor",
    }, { status: 500 });
  }
}
