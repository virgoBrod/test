"use client";

interface Props {
  label: string;
  value: string | number;
  sublabel?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  color?: "default" | "green" | "red" | "indigo";
}

export default function MetricCard({
  label,
  value,
  sublabel,
  trend,
  trendValue,
  color = "default",
}: Props) {
  const colorClasses = {
    default: "text-gray-900",
    green: "text-green-600",
    red: "text-red-600",
    indigo: "text-indigo-600",
  };

  const trendIcons = {
    up: "↑",
    down: "↓",
    neutral: "→",
  };

  const trendColors = {
    up: "text-green-600",
    down: "text-red-600",
    neutral: "text-gray-400",
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <div className="flex items-end gap-2 mt-1.5">
        <p className={`text-3xl font-bold ${colorClasses[color]}`}>
          {value}
        </p>
        {trend && trendValue && (
          <span className={`text-sm font-medium ${trendColors[trend]}`}>
            {trendIcons[trend]} {trendValue}
          </span>
        )}
      </div>
      {sublabel && (
        <p className="text-xs text-gray-400 mt-1">{sublabel}</p>
      )}
    </div>
  );
}
