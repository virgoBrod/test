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

    const result = await createTicket({ name, content, categoryKey, url, method, error });

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
