"use client";

import { useState } from "react";
import { Bar, BarChart, LabelList, ResponsiveContainer, XAxis, YAxis } from "recharts";

type DayEntry = { date: string; activity: string };
type Row = { id: string; name: string; count: number; days: DayEntry[] };

function fmt(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function ParticipationChart({ rows }: { rows: Row[] }) {
  const [limit, setLimit] = useState("20");
  const [selected, setSelected] = useState<Row | null>(null);

  const shown = limit === "all" ? rows : rows.slice(0, Number(limit));
  const height = Math.max(shown.length * 36 + 20, 120);

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Participation</h2>
        <select
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm"
        >
          <option value="5">Top 5</option>
          <option value="10">Top 10</option>
          <option value="20">Top 20</option>
          <option value="all">All</option>
        </select>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-2">
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={shown} layout="vertical" margin={{ left: 0, right: 30, top: 5, bottom: 5 }}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              width={100}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
              tickFormatter={(v: string) => (v.length > 14 ? v.slice(0, 13) + "…" : v)}
            />
            <Bar
              dataKey="count"
              fill="#2563eb"
              radius={[0, 4, 4, 0]}
              barSize={22}
              cursor="pointer"
              onClick={(_, index) => setSelected(shown[index])}
            >
              <LabelList dataKey="count" position="right" fontSize={12} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-xs text-gray-500">Tap a bar to see daily activity.</p>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
          onClick={() => setSelected(null)}
        >
          <div
            className="max-h-[80vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 sm:max-w-md sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">{selected.name}</h3>
                <p className="text-sm text-gray-500">{selected.count} days</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-2xl leading-none text-gray-400">
                ×
              </button>
            </div>
            {selected.days.length === 0 ? (
              <p className="text-sm text-gray-500">No activity yet.</p>
            ) : (
              <ul className="space-y-2">
                {selected.days.map((d) => (
                  <li key={d.date} className="flex gap-3 text-sm">
                    <span className="w-14 shrink-0 font-medium">{fmt(d.date)}</span>
                    <span>{d.activity}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </section>
  );
}