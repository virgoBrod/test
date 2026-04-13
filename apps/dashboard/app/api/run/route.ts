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
  const { collectionId, credentials } = body as {
    collectionId: CollectionId;
    credentials: Record<string, string>;
  };

  const config = getCollection(collectionId);
  if (!config) {
    return new Response(JSON.stringify({ error: "Collection not found" }), {
      status: 404,
    });
  }

  const result = await db.execute({
    sql: `INSERT INTO executions (collection, environment, started_at, status)
          VALUES (?, ?, ?, 'running')`,
    args: [config.name, config.environmentFile, new Date().toISOString()],
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

      runCollection(config, credentials, executionId, send);
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
