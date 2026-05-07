import { NextRequest, NextResponse } from "next/server";
import { createTicket } from "@/lib/glpi";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, content, categoryKey, url, method, error } = body;

    if (!name || !content) {
      return NextResponse.json(
        { error: "name and content are required" },
        { status: 400 }
      );
    }

    console.log("[GLPI] Creating ticket:", { name, categoryKey });
    console.log("[GLPI] API URL:", process.env.GLPI_API_URL ? "configured" : "MISSING");
    console.log("[GLPI] APP_TOKEN:", process.env.GLPI_APP_TOKEN ? "configured" : "MISSING");
    console.log("[GLPI] USER_TOKEN:", process.env.GLPI_USER_TOKEN ? "configured" : "MISSING");

    const result = await createTicket({ name, content, categoryKey, url, method, error });

    console.log("[GLPI] Ticket created:", result.id);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[GLPI] Error creating ticket:", message);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
