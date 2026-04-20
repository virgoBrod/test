"use client";

import { RunEvent } from "@/lib/runner";
import CreateTicketButton from "./CreateTicketButton";

interface Props {
  events: RunEvent[];
  running: boolean;
}

export default function WebSocketLiveExecution({ events, running }: Props) {
  const doneEvent = events.find((e) => e.type === "done");
  const totalMessages = (doneEvent?.data?.totalMessages as number) || 0;

  // Build unique types map from the done event wsTypes array
  const typeMap = new Map<string, number>();
  if (doneEvent?.data?.wsTypes) {
    const wsTypes = doneEvent.data.wsTypes as string[];
    wsTypes.forEach((entry: string) => {
      // Parse "type (count)" format
      const match = entry.match(/^(.+)\s+\((\d+)\)$/);
      if (match) {
        typeMap.set(match[1], parseInt(match[2]));
      } else {
        typeMap.set(entry, 1);
      }
    });
  }

  const items = events.filter((e) => e.type === "item");

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <div className="bg-gray-50 px-4 py-2.5 flex items-center gap-2 border-b border-gray-100">
        {running && (
          <span className="inline-block w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
        )}
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          {running ? "Conectando al WebSocket..." : "Resultado"}
        </span>
      </div>

      <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
        {running && items.length === 0 && (
          <div className="px-4 py-3 text-sm text-gray-400">
            Esperando conexión al WebSocket...
          </div>
        )}

        {doneEvent && (
          <div className="px-4 py-3">
            <div className="flex items-center gap-2 mb-3">
              <span
                className={`shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${
                  doneEvent.data.status === "passed"
                    ? "bg-green-500"
                    : "bg-red-500"
                }`}
              >
                {doneEvent.data.status === "passed" ? "✓" : "✗"}
              </span>
              <span className="text-sm font-medium text-gray-800">
                WebSocket Types Monitor
              </span>
            </div>

            <div className="ml-6 space-y-1">
              <p className="text-xs text-gray-500">
                Total mensajes: {totalMessages} · Tipos únicos: {typeMap.size}
              </p>

              {typeMap.size > 0 && (
                <div className="mt-3 border border-gray-100 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-3 py-1.5 flex justify-between text-[10px] font-medium text-gray-500 uppercase tracking-wide">
                    <span>Type</span>
                    <span>Count</span>
                  </div>
                  {Array.from(typeMap.entries()).map(([type, count]) => (
                    <div
                      key={type}
                      className="px-3 py-1.5 flex justify-between items-center border-t border-gray-50"
                    >
                      <span className="text-xs font-mono text-gray-800">
                        {type}
                      </span>
                      <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {doneEvent.data.status === "failed" && (
                <CreateTicketButton
                  requestName="WebSocket Types Monitor"
                  url="wss://web.inovisec.com/ws"
                  method="WS"
                  error="WebSocket failed or no messages received"
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
