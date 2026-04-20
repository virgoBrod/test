import { NextRequest } from "next/server";
import { initDb, db } from "@/lib/db";

const CSM_TOKENS: Record<string, string> = {
  sales: process.env.CSM_TOKEN_SALES || "",
  medellin: process.env.CSM_TOKEN_MEDELLIN || "",
  movilidad_medellin: process.env.CSM_TOKEN_MOVILIDAD_MEDELLIN || "",
  lv: process.env.CSM_TOKEN_LV || "",
  amva: process.env.CSM_TOKEN_AMVA || "",
};

export async function POST(req: NextRequest) {
  await initDb();
  const body = await req.json();
  const { project_id, user_identifier } = body;

  if (!project_id || !user_identifier) {
    return Response.json(
      { success: false, message: "Falta project_id o user_identifier" },
      { status: 400 }
    );
  }

  if (!user_identifier.includes("@")) {
    return Response.json(
      { success: false, message: "El identificador debe ser un email válido" },
      { status: 400 }
    );
  }

  const projectResult = await db.execute({
    sql: `SELECT base_url_csm FROM projects WHERE id = ?`,
    args: [project_id],
  });

  if (!projectResult.rows.length) {
    return Response.json(
      { success: false, message: "Proyecto no encontrado" },
      { status: 404 }
    );
  }

  const baseUrl = projectResult.rows[0].base_url_csm as string;

  if (!baseUrl) {
    return Response.json(
      { success: false, message: "URL CSM no configurada para este proyecto" },
      { status: 500 }
    );
  }

  const csmToken = CSM_TOKENS[project_id];
  if (!csmToken) {
    return Response.json(
      { success: false, message: "Token CSM no configurado para este proyecto" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(`${baseUrl}/api/logout_force`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${csmToken}`,
      },
      body: JSON.stringify({ email: user_identifier }),
    });

    const responseData = await response.json().catch(() => ({}));

    if (response.ok) {
      return Response.json({
        success: true,
        message: responseData.message || "Sesión cerrada exitosamente",
        data: responseData.data,
      });
    } else {
      return Response.json({
        success: false,
        message: responseData.message || "Error al cerrar sesión",
      }, { status: response.status });
    }
  } catch {
    return Response.json({
      success: false,
      message: "No se pudo conectar al servidor",
    }, { status: 500 });
  }
}
