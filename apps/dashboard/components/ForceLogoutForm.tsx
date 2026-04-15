"use client";

import { useState } from "react";
import type { Project } from "@/types";

interface Props {
  selectedProject: Project | null;
  onSubmit: (projectId: string, userIdentifier: string) => Promise<void>;
}

export default function ForceLogoutForm({ selectedProject, onSubmit }: Props) {
  const [userIdentifier, setUserIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !userIdentifier) return;

    setLoading(true);
    setMessage(null);

    try {
      await onSubmit(selectedProject.id, userIdentifier);
      setMessage({ type: "success", text: "Sesión cerrada exitosamente" });
      setUserIdentifier("");
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Error al cerrar sesión",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!selectedProject) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <p className="text-gray-500 text-sm">
          Seleccioná un proyecto arriba para usar las herramientas CSM.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Forzar Cierre de Sesión</h2>
      <p className="text-sm text-gray-500 mb-6">
        Proyecto: <span className="font-medium text-gray-700">{selectedProject.name}</span>
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Identificador de Usuario
          </label>
          <input
            type="text"
            value={userIdentifier}
            onChange={(e) => setUserIdentifier(e.target.value)}
            placeholder="Callsign o User ID"
            required
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900
              focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
              placeholder:text-gray-400"
          />
        </div>

        {message && (
          <div
            className={`text-sm px-4 py-3 rounded-xl ${
              message.type === "success"
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !userIdentifier}
          className="w-full py-2.5 rounded-xl text-sm font-medium transition-colors
            bg-red-600 text-white hover:bg-red-700
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Cerrando sesión..." : "Forzar Cierre de Sesión"}
        </button>
      </form>
    </div>
  );
}
