"use client";

type Props = {
  title: string;
  value: string;
  trendLabel?: string;
  trendValue?: string;
  color?: "blue" | "green" | "purple" | "amber";
  progress?: number; // 0-100
};

const colorMap: Record<NonNullable<Props["color"]>, string> = {
  blue: "text-blue-600",
  green: "text-green-600",
  purple: "text-purple-600",
  amber: "text-amber-600",
};

export default function KpiCard({ title, value, trendLabel, trendValue, color = "blue", progress }: Props) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <p className="text-sm text-gray-600">{title}</p>
      <p className={`mt-1 text-2xl font-semibold ${colorMap[color]}`}>{value}</p>
      {(trendLabel || trendValue) && (
        <p className="mt-1 text-xs text-gray-500">
          {trendLabel} {trendValue ? <span className="font-medium text-gray-700">{trendValue}</span> : null}
        </p>
      )}
      {typeof progress === "number" && (
        <div className="mt-3 h-2 w-full rounded bg-gray-100">
          <div
            className={`h-2 rounded ${
              color === "blue" ? "bg-blue-500" : color === "green" ? "bg-green-500" : color === "purple" ? "bg-purple-500" : "bg-amber-500"
            }`}
            style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
          />
        </div>
      )}
    </div>
  );
}