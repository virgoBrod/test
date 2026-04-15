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
  const { collectionId, credentials, projectId } = body as {
    collectionId: CollectionId;
    credentials: Record<string, string>;
    projectId?: string;
  };

  const config = getCollection(collectionId);
  if (!config) {
    return new Response(JSON.stringify({ error: "Collection not found" }), {
      status: 404,
    });
  }

  const envVars: { key: string; value: string }[] = [];

  if (projectId) {
    const projectResult = await db.execute({
      sql: `SELECT * FROM projects WHERE id = ?`,
      args: [projectId],
    });

    if (projectResult.rows.length) {
      const project = projectResult.rows[0];
      const baseUrlMobile = project.base_url_mobile as string;
      const baseUrlWeb = project.base_url_web as string;

      if (config.type === "mobile") {
        envVars.push({ key: "baseUrl", value: baseUrlMobile });
        envVars.push({ key: "webBaseUrl", value: baseUrlWeb });
      } else {
        envVars.push({ key: "webBaseUrl", value: baseUrlWeb });
      }
    }
  }

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
