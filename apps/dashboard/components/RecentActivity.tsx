"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { Execution } from "@/types";

type StatusFilter = "all" | "passed" | "failed";
const ITEMS_PER_PAGE = 10;

interface Props {
  projectId?: string;
}

export default function RecentActivity({ projectId }: Props) {
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: String(ITEMS_PER_PAGE),
        offset: String(page * ITEMS_PER_PAGE),
      });
      if (projectId) params.set("project_id", projectId);
      if (filter !== "all") params.set("status", filter);

      const res = await fetch(`/api/executions?${params}`);
      const data = await res.json();
      setExecutions(data.executions || []);
      setTotal(data.total || 0);
    } catch {
      setExecutions([]);
    } finally {
      setLoading(false);
    }
  }, [filter, page, projectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Historial</h3>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {(["all", "passed", "failed"] as StatusFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(0); }}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                filter === f
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {f === "all" ? "Todos" : f === "passed" ? "Exitosos" : "Fallidos"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-gray-400 py-8 text-center">Cargando...</div>
      ) : executions.length === 0 ? (
        <p className="text-sm text-gray-400 py-8 text-center">
          No hay ejecuciones {filter === "all" ? "" : filter === "passed" ? "exitosas" : "fallidas"}
        </p>
      ) : (
        <>
          <div className="divide-y divide-gray-50">
            {executions.map((exec) => {
              const date = new Date(exec.started_at);
              const formattedDate = date.toLocaleDateString("es-AR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              });
              const formattedTime = date.toLocaleTimeString("es-AR", {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <Link
                  key={exec.id}
                  href={`/history/${exec.id}`}
                  className="flex items-center justify-between py-3 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        exec.status === "passed"
                          ? "bg-green-500"
                          : exec.status === "failed"
                          ? "bg-red-500"
                          : exec.status === "running"
                          ? "bg-indigo-400 animate-pulse"
                          : "bg-gray-400"
                      }`}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {exec.collection}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formattedDate} · {formattedTime}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-green-600 font-medium">
                      {exec.passed} ✓
                    </span>
                    {exec.failed > 0 && (
                      <span className="text-red-600 font-medium">
                        {exec.failed} ✗
                      </span>
                    )}
                    <span className="text-gray-400 text-xs">
                      {exec.duration_ms > 0
                        ? `${(exec.duration_ms / 1000).toFixed(1)}s`
                        : "—"}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
              <span className="text-xs text-gray-400">
                {page * ITEMS_PER_PAGE + 1}-{Math.min((page + 1) * ITEMS_PER_PAGE, total)} de {total}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-2 py-1 text-xs rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ←
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="px-2 py-1 text-xs rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
