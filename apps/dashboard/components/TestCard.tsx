"use client";

import { useState } from "react";
import type { CollectionType } from "@/types";
import CredentialsModal from "./CredentialsModal";
import LiveExecution from "./LiveExecution";
import WebSocketLiveExecution from "./WebSocketLiveExecution";
import { RunEvent } from "@/lib/runner";
import { showToast } from "./Toast";

interface CollectionData {
  id: string;
  name: string;
  description: string;
  type: CollectionType;
}

interface Props {
  collectionId: string;
  collectionName: string;
  description?: string;
  type: CollectionType;
  lastExecution?: Execution | null;
  projectId?: string;
  onExecutionComplete?: () => void;
  onExport?: (executionId: number) => void;
}

interface Execution {
  id: number;
  status: string;
  finished_at: string;
}

export default function TestCard({ 
  collectionId, 
  collectionName, 
  description,
  type,
  lastExecution, 
  projectId, 
  onExecutionComplete, 
  onExport 
}: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [events, setEvents] = useState<RunEvent[]>([]);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  const collection: CollectionData = {
    id: collectionId,
    name: collectionName,
    description: description || collectionName,
    type,
  };

  const handleRun = async (credentials: Record<string, string>) => {
    setModalOpen(false);
    setEvents([]);
    setRunning(true);
    setDone(false);

    const apiEndpoint = type === "websocket" ? "/api/run-ws" : "/api/run";
    const apiBody = type === "websocket"
      ? { credentials, projectId, projectName: projectId }
      : { 
          collectionId: collection.id as any, 
          credentials, 
          projectId,
          projectName: projectId
        };

    try {
      const res = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiBody),
      });

      if (!res.ok) {
        const error = await res.text();
        showToast(`Error: ${error}`, "error");
        setRunning(false);
        setDone(true);
        return;
      }

      if (!res.body) {
        setRunning(false);
        setDone(true);
        return;
      }

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
                onExecutionComplete?.();
              }
            } catch {
              // ignore malformed lines
            }
          }
        }
      }
    } catch (err) {
      console.error("Execution error:", err);
      setRunning(false);
      setDone(true);
      showToast("Error al ejecutar el test", "error");
    }
  };

  const onExecuteClick = async () => {
    if (!projectId) {
      showToast("Seleccioná un proyecto primero", "error");
      return;
    }

    try {
      const res = await fetch(`/api/projects/${projectId}/credentials`);
      const data = await res.json();

      if (data.credentials) {
        const creds = data.credentials as any;
        let formattedCreds: Record<string, string> = {};

        if (type === "mobile" && creds.mobile) {
          formattedCreds = {
            callsign: creds.mobile.callsign,
            password: creds.mobile.password,
          };
        } else if (type === "web" && creds.web) {
          formattedCreds = {
            webEmail: creds.web.email,
            webPassword: creds.web.password,
          };
        }

        if (formattedCreds.callsign || formattedCreds.webEmail) {
          handleRun(formattedCreds);
          return;
        }
      }

      setModalOpen(true);
    } catch {
      setModalOpen(true);
    }
  };

  const lastDone = events.find((e) => e.type === "done");

  const statusBadge = done && lastDone ? (
    <span
      className={`text-xs font-medium px-2.5 py-1 rounded-full ${
        lastDone.data.status === "passed"
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-700"
      }`}
    >
      {lastDone.data.status === "passed" ? "Exitoso" : "Falló"}
    </span>
  ) : lastExecution?.status === "passed" ? (
    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-700">
      Exitoso
    </span>
  ) : lastExecution?.status === "failed" ? (
    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-red-100 text-red-700">
      Falló
    </span>
  ) : (
    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">
      Nunca ejecutado
    </span>
  );

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {collectionName}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">{description}</p>
          </div>
          {statusBadge}
        </div>

        {(running || done) && (
          type === "websocket" ? (
            <WebSocketLiveExecution events={events} running={running} />
          ) : (
            <LiveExecution events={events} running={running} />
          )
        )}

        <div className="flex gap-2 mt-auto">
          <button
            onClick={onExecuteClick}
            disabled={running}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors
              bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {running ? "Ejecutando..." : "Ejecutar"}
          </button>
          {onExport && lastExecution?.id && (
            <button
              onClick={() => onExport(lastExecution.id)}
              className="px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-200
                text-gray-600 hover:bg-gray-50 transition-colors"
            >
              PDF
            </button>
          )}
        </div>
      </div>

      {modalOpen && (
        <CredentialsModal
          collection={collection}
          projectId={projectId}
          onConfirm={handleRun}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
