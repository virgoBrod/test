import { NextRequest } from "next/server";
import { initDb, db } from "@/lib/db";
import { getCollection, CollectionId } from "@/lib/collections";
import { runCollection, RunEvent } from "@/lib/runner";
import path from "path";
import fs from "fs";

export async function POST(req: NextRequest) {
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  await initDb();

  const body = await req.json();
  const { collectionId, credentials, projectId, projectName } = body as {
    collectionId: CollectionId;
    credentials: Record<string, string>;
    projectId?: string;
    projectName?: string;
  };

  // Use projectName if provided (from new flow-based system), otherwise default to projectId
  const projectToUse = projectName || projectId || "sales";
  const config = getCollection(collectionId, projectToUse);
  if (!config) {
    return new Response(JSON.stringify({ error: "Collection not found" }), {
      status: 404,
    });
  }

  const envVars: { key: string; value: string }[] = [];

  // Base URLs are now loaded from environment files, no need to inject them
  // The environment files already contain the correct base URLs for each project

  for (const field of config.credentialFields) {
    envVars.push({ key: field.envVar, value: credentials[field.key] ?? "" });
  }

  const result = await db.execute({
    sql: `INSERT INTO executions (collection, environment, started_at, status, project_id)
          VALUES (?, ?, ?, 'running', ?)`,
    args: [config.name, config.environmentFile, new Date().toISOString(), projectId ?? null],
  });

  const executionId = Number(result.lastInsertRowid);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const send = (event: RunEvent) => {
        const data = `data: ${JSON.stringify(event)}\n\n`;
        controller.enqueue(encoder.encode(data));
        if (event.type === "done" || event.type === "error") {
          controller.close();
        }
      };

      runCollection(config, envVars, executionId, send);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
