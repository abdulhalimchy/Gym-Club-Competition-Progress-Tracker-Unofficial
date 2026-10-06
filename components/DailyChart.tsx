"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, LabelList, ResponsiveContainer, XAxis, YAxis } from "recharts";
import Sheet from "./Sheet";
import { fmtDate, plural } from "@/lib/format";

type Day = {
  date: string;
  count: number;
  people: { name: string; activity: string }[];
};

export default function DailyChart({ rows }: { rows: Day[] }) {
  const [selected, setSelected] = useState<Day | null>(null);

  const data = useMemo(() => rows.map((r) => ({ ...r, label: fmtDate(r.date) })), [rows]);

  if (rows.length === 0) return null;

  // one row per day, so a whole month just makes the chart taller (no sideways scrolling)
  const ROW = 30;
  const height = rows.length * ROW + 16;

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">Daily participation</h2>

      <div className="rounded-xl border border-gray-200 bg-white p-2">
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            accessibilityLayer={false}
            data={data}
            layout="vertical"
            barCategoryGap={0}
            margin={{ left: 0, right: 30, top: 8, bottom: 8 }}
          >
            {/* "dataMax" makes the longest bar fill the width; the default rounds the max up to a "nice" number */}
            <XAxis type="number" hide domain={[0, "dataMax"]} />
            <YAxis
              type="category"
              dataKey="label"
              width={56}
              interval={0}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
            />
            <Bar
              dataKey="count"
              fill="#16a34a"
              radius={[0, 4, 4, 0]}
              barSize={20}
              isAnimationActive={false}
              cursor="pointer"
              onClick={(_, index) => setSelected(rows[index])}
            >
              <LabelList dataKey="count" position="right" fontSize={12} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-xs text-gray-500">Tap a bar to see who took part that day.</p>

      {selected && (
        <Sheet
          title={fmtDate(selected.date)}
          subtitle={plural(selected.count, "participant")}
          onClose={() => setSelected(null)}
        >
          {selected.people.length === 0 ? (
            <p className="text-sm text-gray-500">No one recorded on this day.</p>
          ) : (
            <ul className="divide-y">
              {selected.people.map((p) => (
                <li key={p.name} className="flex justify-between gap-3 py-2 text-sm">
                  <span className="font-medium">{p.name}</span>
                  <span className="text-right text-gray-500">{p.activity}</span>
                </li>
              ))}
            </ul>
          )}
        </Sheet>
      )}
    </section>
  );
}