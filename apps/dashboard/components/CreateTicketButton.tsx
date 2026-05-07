"use client";

import { useState } from "react";
import { showToast } from "./Toast";

interface Props {
  requestName: string;
  url: string;
  method: string;
  error?: string | null;
}

export default function CreateTicketButton({ requestName, url, method, error }: Props) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/glpi/ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `Test failed: ${requestName}`,
          content: [
            `**Request:** ${requestName}`,
            `**URL:** ${url}`,
            `**Method:** ${method}`,
            error ? `**Error:** ${error}` : "",
            `**Date:** ${new Date().toISOString()}`,
          ].filter(Boolean).join("\n\n"),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create ticket");
      }

      showToast(`Ticket GLPI #${data.id} creado: ${data.url}`, "success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error creando ticket";
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="mt-1 flex items-center gap-1 text-xs font-medium text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-2 py-1 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <>
          <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Creando...
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
          Crear ticket GLPI
        </>
      )}
    </button>
  );
}
