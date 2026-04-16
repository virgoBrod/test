"use client";

import { useState, useEffect } from "react";
import TestCard from "@/components/TestCard";
import { useProject } from "@/components/ProjectContext";
import { showToast } from "@/components/Toast";
import { downloadPDF } from "@/lib/pdf";
import type { Execution, ExecutionResult, CollectionType } from "@/types";

interface Collection {
  id: string;
  name: string;
  description: string;
  type: CollectionType;
  hasAssertions: boolean;
}

export default function AppsPage() {
  const [activeTab, setActiveTab] = useState<"mobile" | "web">("mobile");
  const [collections, setCollections] = useState<Collection[]>([]);
  const [lastExecutions, setLastExecutions] = useState<Record<string, Execution>>({});
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const { project } = useProject();

  useEffect(() => {
    if (!project?.id) {
      setLoading(false);
      return;
    }

    const loadCollections = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/flows?project=${project.id}`);
        const data = await res.json();
        setCollections(data.flows || []);
      } catch (err) {
        console.error("Error loading flows:", err);
        setCollections([]);
      } finally {
        setLoading(false);
      }
    };

    loadCollections();
  }, [project?.id]); // Don't reload collections on refreshKey, only on project change

  useEffect(() => {
    const loadLastExecutions = async () => {
      if (!project?.id) return;

      const results: Record<string, Execution> = {};
      for (const col of collections) {
        try {
          const res = await fetch(`/api/executions?collection=${encodeURIComponent(col.name)}&project=${project.id}&limit=1`);
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

    if (collections.length > 0) {
      loadLastExecutions();
    }
  }, [collections, project?.id, refreshKey]);

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

  const filteredCollections = collections.filter((c) => c.type === activeTab);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Apps</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Ejecutá tests de Mobile y Web
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-gray-100 animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Apps</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Ejecutá tests de Mobile y Web {project?.name ? `para ${project.name}` : ""}
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
        {filteredCollections.map((collection) => (
          <TestCard
            key={collection.id}
            collectionId={collection.id}
            collectionName={collection.name}
            description={collection.description || `${collection.name} flow for ${project?.name}`}
            type={collection.type}
            lastExecution={lastExecutions[collection.id]}
            projectId={project?.id}
            onExecutionComplete={handleExecutionComplete}
            onExport={handleExport}
          />
        ))}
      </div>

      {filteredCollections.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-2">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-lg font-medium text-gray-600">No hay flows establecidos</h3>
            <p className="text-sm mt-1">
              Este proyecto aún no tiene flows de test configurados
            </p>
            {project?.name && (
              <p className="text-xs text-gray-400 mt-2">
                Proyecto: {project.name}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
