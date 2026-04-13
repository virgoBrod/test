"use client";

import { CollectionConfig } from "@/lib/collections";
import { useState } from "react";
import CredentialsModal from "./CredentialsModal";
import LiveExecution from "./LiveExecution";
import { RunEvent } from "@/lib/runner";

interface Props {
  collection: CollectionConfig;
  onExecutionComplete: () => void;
}

export default function CollectionCard({ collection, onExecutionComplete }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [events, setEvents] = useState<RunEvent[]>([]);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  const handleRun = async (credentials: Record<string, string>) => {
    setModalOpen(false);
    setEvents([]);
    setRunning(true);
    setDone(false);

    const res = await fetch("/api/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ collectionId: collection.id, credentials }),
    });

    if (!res.body) return;

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done: streamDone, value } = await reader.read();
      if (streamDone) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const event: RunEvent = JSON.parse(line.slice(6));
            setEvents((prev) => [...prev, event]);
            if (event.type === "done" || event.type === "error") {
              setRunning(false);
              setDone(true);
              onExecutionComplete();
            }
          } catch {
            // ignore malformed lines
          }
        }
      }
    }
  };

  const lastDone = events.find((e) => e.type === "done");
  const hasError = events.find((e) => e.type === "error");

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {collection.name}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">{collection.description}</p>
          </div>

          {done && lastDone && (
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                lastDone.data.status === "passed"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {lastDone.data.status === "passed" ? "Pasó" : "Falló"}
            </span>
          )}

          {done && hasError && (
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-red-100 text-red-700">
              Error
            </span>
          )}
        </div>

        {(running || done) && <LiveExecution events={events} running={running} />}

        <button
          onClick={() => setModalOpen(true)}
          disabled={running}
          className="mt-auto w-full py-2.5 rounded-xl text-sm font-medium transition-colors
            bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {running ? "Ejecutando..." : "Ejecutar"}
        </button>
      </div>

      {modalOpen && (
        <CredentialsModal
          collection={collection}
          onConfirm={handleRun}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
