"use client";

import { useState, useEffect, useMemo } from "react";
import MetricCard from "@/components/MetricCard";
import TrendChart from "@/components/TrendChart";
import RecentActivity from "@/components/RecentActivity";
import type { MetricSummary, TrendDataPoint } from "@/types";
import { useProject } from "@/components/ProjectContext";

type Period = "today" | "week" | "month";

const periodLabels: Record<Period, string> = {
  today: "Hoy",
  week: "Semana",
  month: "Mes",
};

const MemoizedMetricCard = MetricCard;
const MemoizedTrendChart = TrendChart;

export default function OverviewPage() {
  const { project } = useProject();
  const [metrics, setMetrics] = useState<MetricSummary>({
    total: 0,
    passed: 0,
    failed: 0,
    passRate: 0,
  });
  const [trend, setTrend] = useState<TrendDataPoint[]>([]);
  const [period, setPeriod] = useState<Period>("week");

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      fetch("/api/metrics/summary")
        .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
        .catch(() => ({ total: 0, passed: 0, failed: 0, passRate: 0 })),
      fetch(`/api/metrics/trend?period=${period}`)
        .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
        .catch(() => []),
    ])
      .then(([metricsData, trendData]) => {
        if (cancelled) return;
        setMetrics(metricsData);
        setTrend(Array.isArray(trendData) ? trendData : []);
      })
      .catch((err) => {
        if (!cancelled) console.error("Failed to load dashboard data:", err);
      });

    return () => {
      cancelled = true;
    };
  }, [period]);

  const projectId = project?.id;

  const header = useMemo(() => (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Resumen</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Estado de los tests ejecutados
        </p>
      </div>
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
        {(Object.keys(periodLabels) as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              period === p
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {periodLabels[p]}
          </button>
        ))}
      </div>
    </div>
  ), [period]);

  const metricCards = useMemo(() => (
    <div className="grid grid-cols-4 gap-4">
      <MemoizedMetricCard label="Total" value={metrics.total} sublabel="Tests ejecutados" />
      <MemoizedMetricCard label="Exitosos" value={metrics.passed} color="green" sublabel="Tests que pasaron" />
      <MemoizedMetricCard label="Fallidos" value={metrics.failed} color="red" sublabel="Tests con errores" />
      <MemoizedMetricCard label="Tasa de Éxito" value={`${metrics.passRate}%`} color="indigo" sublabel="Porcentaje de éxito" />
    </div>
  ), [metrics]);

  return (
    <div className="space-y-6">
      {header}
      {metricCards}
      <MemoizedTrendChart data={trend} />
      <RecentActivity key={`${projectId}-${period}`} projectId={projectId} />
    </div>
  );
}
