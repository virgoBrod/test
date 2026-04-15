"use client";

import Link from "next/link";
import type { Execution } from "@/types";

interface Props {
  executions: Execution[];
}

export default function RecentActivity({ executions }: Props) {
  if (!executions.length) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
        <p className="text-sm text-gray-400 py-8 text-center">
          Aún no hay ejecuciones registradas
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
      <div className="divide-y divide-gray-50">
        {executions.slice(0, 5).map((exec) => {
          const date = new Date(exec.started_at);
          const formattedDate = date.toLocaleDateString("es-AR", {
            day: "2-digit",
            month: "2-digit",
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
    </div>
  );
}
