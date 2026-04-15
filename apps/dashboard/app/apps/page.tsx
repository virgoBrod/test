"use client";

import { useState, useEffect } from "react";
import { COLLECTIONS } from "@/lib/collections";
import TestCard from "@/components/TestCard";
import { useProject } from "@/components/ProjectContext";
import { showToast } from "@/components/Toast";
import { downloadPDF } from "@/lib/pdf";
import type { Execution, ExecutionResult } from "@/types";

export default function AppsPage() {
  const [activeTab, setActiveTab] = useState<"mobile" | "web">("mobile");
  const [lastExecutions, setLastExecutions] = useState<Record<string, Execution>>({});
  const [refreshKey, setRefreshKey] = useState(0);
  const { project } = useProject();

  useEffect(() => {
    const loadLastExecutions = async () => {
      const results: Record<string, Execution> = {};
      for (const col of COLLECTIONS) {
        try {
          const res = await fetch(`/api/executions?collection=${encodeURIComponent(col.name)}&limit=1`);
          if (!res.ok) continue;
          const data = await res.json();
          if (data.length > 0) {
            results[col.id] = data[0];
          }
        } catch {
          // ignore
        }
      }
      setLastExecutions(results);
    };
    loadLastExecutions();
  }, [refreshKey]);

  const handleExport = async (executionId: number) => {
    try {
      const res = await fetch(`/api/executions/${executionId}`);
      if (!res.ok) {
        showToast("Error al obtener datos de la ejecución", "error");
        return;
      }
      const { execution, results } = await res.json();
      downloadPDF(execution as Execution, results as ExecutionResult[]);
      showToast("PDF generado exitosamente", "success");
    } catch {
      showToast("Error al generar PDF", "error");
    }
  };

  const handleExecutionComplete = () => {
    setRefreshKey((k) => k + 1);
    showToast("Ejecución completada", "success");
  };

  const mobileCollections = COLLECTIONS.filter((c) => c.type === "mobile");
  const webCollections = COLLECTIONS.filter((c) => c.type === "web");
  const displayCollections = activeTab === "mobile" ? mobileCollections : webCollections;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Apps</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Ejecutá tests de Mobile y Web
        </p>
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab("mobile")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "mobile"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Mobile
        </button>
        <button
          onClick={() => setActiveTab("web")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "web"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Web
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayCollections.map((collection) => (
          <TestCard
            key={collection.id}
            collection={collection}
            lastExecution={lastExecutions[collection.id]}
            projectId={project?.id}
            onExecutionComplete={handleExecutionComplete}
            onExport={handleExport}
          />
        ))}
      </div>

      {displayCollections.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          No hay collections para esta categoría
        </div>
      )}
    </div>
  );
}
