import { NextRequest } from "next/server";
import { initDb, db } from "@/lib/db";
import { encrypt, decrypt } from "@/lib/encryption";
import type { Credentials } from "@/types";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await initDb();
  const { id } = await params;

  const result = await db.execute({
    sql: `SELECT * FROM credentials WHERE project_id = ?`,
    args: [id],
  });

  if (!result.rows.length) {
    return Response.json({ credentials: null });
  }

  try {
    const decrypted = await decrypt(result.rows[0].encrypted_data as string);
    return Response.json({ credentials: JSON.parse(decrypted) as Credentials });
  } catch {
    return Response.json({ credentials: null });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await initDb();
  const { id } = await params;
  const body = await req.json();
  const credentials = body.credentials as Credentials;

  if (!credentials) {
    return Response.json({ error: "Missing credentials" }, { status: 400 });
  }

  const encrypted = await encrypt(JSON.stringify(credentials));

  await db.execute({
    sql: `INSERT OR REPLACE INTO credentials (project_id, encrypted_data, updated_at)
          VALUES (?, ?, datetime('now'))`,
    args: [id, encrypted],
  });

  return Response.json({ success: true });
}
