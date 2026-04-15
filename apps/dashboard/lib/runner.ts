import newman from "newman";
import { db } from "./db";
import { CollectionConfig } from "./collections";

export interface RunEvent {
  type: "start" | "item" | "done" | "error";
  data: Record<string, unknown>;
}

export function runCollection(
  config: CollectionConfig,
  envVars: { key: string; value: string }[],
  executionId: number,
  onEvent: (event: RunEvent) => void
): void {

  onEvent({ type: "start", data: { executionId } });

  type AssertionResult = { name: string; passed: boolean; error?: string };
  type RequestInfo = {
    name: string;
    url: string;
    method: string;
    statusCode: number | null;
    duration: number;
    responseBody: string | null;
  };

  const assertionsMap = new Map<string, AssertionResult[]>();
  const requestMap = new Map<string, RequestInfo>();

  const run = newman.run(
    {
      collection: config.collectionFile,
      environment: config.environmentFile,
      envVar: envVars,
      reporters: [],
    },
    async (err, summary) => {
      if (err) {
        onEvent({ type: "error", data: { message: err.message } });
        await db.execute({
          sql: `UPDATE executions SET status = 'error', finished_at = ? WHERE id = ?`,
          args: [new Date().toISOString(), executionId],
        });
        return;
      }

      const stats = summary.run.stats;
      const totalReqs = stats.requests.total ?? 0;
      const failedReqs = stats.requests.failed ?? 0;
      const failedAssertions = stats.assertions.failed ?? 0;
      const durationMs =
        (summary.run.timings.completed ?? 0) -
        (summary.run.timings.started ?? 0);
      const status =
        failedAssertions === 0 && failedReqs === 0 ? "passed" : "failed";

      await db.execute({
        sql: `UPDATE executions
              SET status = ?, finished_at = ?, total = ?, passed = ?, failed = ?, duration_ms = ?
              WHERE id = ?`,
        args: [
          status,
          new Date().toISOString(),
          totalReqs,
          totalReqs - failedReqs,
          failedReqs,
          durationMs,
          executionId,
        ],
      });

      onEvent({
        type: "done",
        data: {
          status,
          total: totalReqs,
          passed: totalReqs - failedReqs,
          failed: failedReqs,
        },
      });
    }
  );

  // Colectamos assertions por item — llegan DESPUÉS del request event
  run.on("assertion", (_err, args) => {
    const key = args.item.id ?? args.item.name;
    const list = assertionsMap.get(key) ?? [];
    list.push({
      name: args.assertion,
      passed: !args.error,
      error: args.error?.message,
    });
    assertionsMap.set(key, list);
  });

  // Guardamos los datos de red del request, incluyendo el response body
  run.on("request", (_err, args) => {
    const key = args.item.id ?? args.item.name;

    let responseBody: string | null = null;
    try {
      const stream = args.response?.stream;
      if (stream) {
        const raw = stream.toString("utf8");
        // Si es JSON, lo pretty-printeamos para legibilidad
        try {
          responseBody = JSON.stringify(JSON.parse(raw), null, 2);
        } catch {
          responseBody = raw;
        }
        // Truncamos a 50KB para no reventar la DB
        if (responseBody && responseBody.length > 50000) {
          responseBody = responseBody.slice(0, 50000) + "\n... [truncado]";
        }
      }
    } catch {
      responseBody = null;
    }

    requestMap.set(key, {
      name: args.item.name,
      url: args.request?.url?.toString() ?? "",
      method: args.request?.method ?? "",
      statusCode: args.response?.code ?? null,
      duration: args.response?.responseTime ?? 0,
      responseBody,
    });
  });

  // Item = request + assertions completados → emitimos acá
  run.on("item", async (err, args) => {
    const key = args.item.id ?? args.item.name;
    const req = requestMap.get(key);
    const assertions = assertionsMap.get(key) ?? [];

    if (!req) return;

    const passed = !err && assertions.every((a) => a.passed);

    await db.execute({
      sql: `INSERT INTO results
              (execution_id, request_name, url, method, status_code, duration_ms, passed, assertions, error, response_body)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        executionId,
        req.name,
        req.url,
        req.method,
        req.statusCode ?? null,
        req.duration,
        passed ? 1 : 0,
        JSON.stringify(assertions),
        err?.message ?? null,
        req.responseBody ?? null,
      ],
    });

    onEvent({
      type: "item",
      data: {
        name: req.name,
        url: req.url,
        method: req.method,
        statusCode: req.statusCode,
        duration: req.duration,
        passed,
        assertions,
        error: err?.message ?? null,
        responseBody: req.responseBody ?? null,
      },
    });
  });
}
