"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Execution {
  id: number;
  collection: string;
  started_at: string;
  finished_at: string | null;
  status: string;
  total: number;
  passed: number;
  failed: number;
  duration_ms: number;
}

interface Props {
  refreshKey: number;
}

export default function HistoryPanel({ refreshKey }: Props) {
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/executions")
      .then((r) => r.json())
      .then((data) => {
        setExecutions(data);
        setLoading(false);
      });
  }, [refreshKey]);

  if (loading) {
    return (
      <div className="text-sm text-gray-400 px-1">Cargando historial...</div>
    );
  }

  if (!executions.length) {
    return (
      <div className="text-sm text-gray-400 px-1">
        Aún no hay ejecuciones guardadas.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
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
              className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
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

              <div className="flex items-center gap-4 text-sm">
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
                <svg
                  className="w-4 h-4 text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
