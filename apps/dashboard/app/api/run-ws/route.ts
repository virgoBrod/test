import { NextRequest } from "next/server";
import { initDb, db } from "@/lib/db";
import path from "path";
import fs from "fs";
import WebSocket from "ws";

export async function POST(req: NextRequest) {
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  await initDb();

  const body = await req.json();
  const { credentials, projectId, projectName } = body as {
    credentials: Record<string, string>;
    projectId?: string;
    projectName?: string;
  };

  const projectToUse = projectName || projectId || "sales";
  const email = credentials.webEmail || "";
  const password = credentials.webPassword || "";
  
  // Obtener la URL del proyecto desde la base de datos (no hardcodeada)
  const projectResult = await db.execute({
    sql: `SELECT base_url_web FROM projects WHERE id = ?`,
    args: [projectToUse],
  });
  
  const baseUrl = (projectResult.rows[0]?.base_url_web as string) || "https://web.inovisec.com";
  
  if (!projectResult.rows.length || !baseUrl) {
    return new Response(
      JSON.stringify({ error: `Project '${projectToUse}' not found or has no web URL configured` }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const result = await db.execute({
    sql: `INSERT INTO executions (collection, environment, started_at, status, project_id)
          VALUES (?, ?, ?, 'running', ?)`,
    args: ["WebSocket Types", "N/A", new Date().toISOString(), projectToUse],
  });

  const executionId = Number(result.lastInsertRowid);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: { type: string; data: Record<string, unknown> }) => {
        const data = `data: ${JSON.stringify(event)}\n\n`;
        controller.enqueue(encoder.encode(data));
      };

      const finish = async (
        status: "passed" | "failed" | "error",
        wsTypes: string[],
        totalMessages: number,
        errorMsg?: string
      ) => {
        const passed = status === "passed";
        await db.execute({
          sql: `UPDATE executions SET status = ?, finished_at = ?, total = ?, passed = ?, failed = ?, duration_ms = ?
                WHERE id = ?`,
          args: [
            status,
            new Date().toISOString(),
            1,
            passed ? 1 : 0,
            passed ? 0 : 1,
            15000,
            executionId,
          ],
        });

        await db.execute({
          sql: `INSERT INTO results
                (execution_id, request_name, url, method, status_code, duration_ms, passed, assertions, error, response_body)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            executionId,
            "WebSocket Types Monitor",
            "wss://web.inovisec.com/ws",
            "WS",
            null,
            15000,
            passed ? 1 : 0,
            JSON.stringify(wsTypes.map((t) => ({ name: `Type: ${t}`, passed: true }))),
            errorMsg || null,
            JSON.stringify({ types: wsTypes, totalMessages }, null, 2),
          ],
        });

        send({
          type: "done",
          data: {
            status,
            total: 1,
            passed: passed ? 1 : 0,
            failed: passed ? 0 : 1,
            wsTypes,
            totalMessages,
          },
        });
        controller.close();
      };

      send({ type: "start", data: { executionId } });

      // Step 1: Login
      send({
        type: "item",
        data: {
          name: "Login",
          url: `${baseUrl}/auth`,
          method: "POST",
          output: "Realizando login...",
          passed: true,
        },
      });

      let token: string | null = null;
      try {
        const loginRes = await fetch(`${baseUrl}/auth`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (!loginRes.ok) {
          // No enviar el body crudo del error al cliente (puede contener info interna)
          send({
            type: "item",
            data: {
              name: "Login",
              url: `${baseUrl}/auth`,
              method: "POST",
              statusCode: loginRes.status,
              output: `Login fallido (HTTP ${loginRes.status})`,
              passed: false,
            },
          });
          await finish("failed", [], 0, `Login failed (HTTP ${loginRes.status})`);
          return;
        }

        const loginBody = await loginRes.json();
        token = loginBody.token;

        send({
          type: "item",
          data: {
            name: "Login",
            url: `${baseUrl}/auth`,
            method: "POST",
            statusCode: loginRes.status,
            output: `Login exitoso — token obtenido`,
            passed: true,
          },
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        send({
          type: "item",
          data: {
            name: "Login",
            url: `${baseUrl}/auth`,
            method: "POST",
            output: `Error en login: ${msg}`,
            passed: false,
          },
        });
        await finish("error", [], 0, msg);
        return;
      }

      // Step 2: Connect to WebSocket and collect types for 10 seconds
      const wsTypes: string[] = [];
      let totalMessages = 0;
      const typeCounts = new Map<string, number>();

      send({
        type: "item",
        data: {
          name: "WebSocket Connect",
          url: `wss://web.inovisec.com/ws?token=***`,
          method: "WS",
          output: "Conectando al WebSocket...",
          passed: true,
        },
      });

      try {
        const ws = new WebSocket(`wss://web.inovisec.com/ws?token=${token}`);

        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            ws.close();
            resolve();
          }, 10000);

          ws.on("open", () => {
            send({
              type: "item",
              data: {
                name: "WebSocket Connected",
                output: "Conexión establecida — recolectando mensajes por 10s...",
                passed: true,
              },
            });
          });

          ws.on("message", (data: WebSocket.Data) => {
            try {
              const msg = JSON.parse(data.toString());
              if (msg.type) {
                wsTypes.push(msg.type);
                totalMessages++;
                typeCounts.set(msg.type, (typeCounts.get(msg.type) || 0) + 1);
              }
            } catch {
              // ignore non-JSON
            }
          });

          ws.on("error", (err: Error) => {
            clearTimeout(timeout);
            reject(err);
          });

          ws.on("close", () => {
            clearTimeout(timeout);
            resolve();
          });
        });

        const uniqueTypes = [...typeCounts.entries()];

        send({
          type: "item",
          data: {
            name: "WebSocket Results",
            output: `Total mensajes: ${totalMessages}`,
            passed: true,
            wsTypes: uniqueTypes.map(([type, count]) => `${type} (${count})`),
          },
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        send({
          type: "item",
          data: {
            name: "WebSocket Error",
            output: `Error: ${msg}`,
            passed: false,
          },
        });
        // Still try logout
      }

      // Step 3: Logout
      send({
        type: "item",
        data: {
          name: "Logout",
          url: `${baseUrl}/logout`,
          method: "POST",
          output: "Realizando logout...",
          passed: true,
        },
      });

      try {
        const logoutRes = await fetch(`${baseUrl}/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (logoutRes.ok) {
          send({
            type: "item",
            data: {
              name: "Logout",
              url: `${baseUrl}/logout`,
              method: "POST",
              statusCode: logoutRes.status,
              output: "Logout exitoso",
              passed: true,
            },
          });
        } else {
          send({
            type: "item",
            data: {
              name: "Logout",
              url: `${baseUrl}/logout`,
              method: "POST",
              statusCode: logoutRes.status,
              output: `Logout fallido: ${logoutRes.status}`,
              passed: false,
            },
          });
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        send({
          type: "item",
          data: {
            name: "Logout",
            output: `Error en logout: ${msg}`,
            passed: false,
          },
        });
      }

      // Final result
      const hasTypes = wsTypes.length > 0;
      await finish(
        hasTypes ? "passed" : "failed",
        wsTypes,
        totalMessages,
        hasTypes ? undefined : "No se recibieron mensajes en 10 segundos"
      );
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
