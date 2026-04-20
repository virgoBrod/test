"use client";

import { RunEvent } from "@/lib/runner";
import CreateTicketButton from "./CreateTicketButton";

interface Props {
  events: RunEvent[];
  running: boolean;
}

interface RequestData {
  name: string;
  url: string;
  method: string;
  statusCode: number | null;
  duration: number;
  passed: boolean;
  assertions: Array<{ name: string; passed: boolean; error?: string }>;
  error: string | null;
}

export default function LiveExecution({ events, running }: Props) {
  const requests = events
    .filter((e) => e.type === "item")
    .map((e) => e.data as unknown as RequestData);

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <div className="bg-gray-50 px-4 py-2.5 flex items-center gap-2 border-b border-gray-100">
        {running && (
          <span className="inline-block w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
        )}
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          {running ? "Ejecutando..." : "Resultado"}
        </span>
      </div>

      <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
        {requests.length === 0 && running && (
          <div className="px-4 py-3 text-sm text-gray-400">
            Esperando primer request...
          </div>
        )}

        {requests.map((req, i) => (
          <div key={i} className="px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${
                    req.passed ? "bg-green-500" : "bg-red-500"
                  }`}
                >
                  {req.passed ? "✓" : "✗"}
                </span>
                <span className="text-sm font-medium text-gray-800 truncate">
                  {req.name}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-gray-400">{req.duration}ms</span>
                {req.statusCode && (
                  <span
                    className={`text-xs font-mono px-1.5 py-0.5 rounded ${
                      req.statusCode >= 200 && req.statusCode < 300
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {req.statusCode}
                  </span>
                )}
              </div>
            </div>

            {!req.passed && (
              <div className="mt-2 ml-6 space-y-1">
                {req.error && (
                  <p className="text-xs text-red-600 bg-red-50 rounded px-2 py-1">
                    {req.error}
                  </p>
                )}
                {req.assertions
                  .filter((a) => !a.passed)
                  .map((a, j) => (
                    <p
                      key={j}
                      className="text-xs text-red-600 bg-red-50 rounded px-2 py-1"
                    >
                      <span className="font-medium">{a.name}:</span>{" "}
                      {a.error}
                    </p>
                  ))}
                <CreateTicketButton
                  requestName={req.name}
                  url={req.url}
                  method={req.method}
                  error={req.error}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
