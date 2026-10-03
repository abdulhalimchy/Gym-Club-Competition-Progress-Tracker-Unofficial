import { eventDetails, participants, participation } from "@/data/competition";

const TIMEZONE = "Europe/Helsinki"; // change to the competition's timezone

export type Status = "Upcoming" | "Running" | "Completed";
export type DayEntry = { date: string; activity: string };
export type Row = { id: string; name: string; count: number; days: DayEntry[] };

export function getStatus(): Status {
  // en-CA gives YYYY-MM-DD
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: TIMEZONE }).format(new Date());
  if (today < eventDetails.start_date) return "Upcoming";
  if (today > eventDetails.end_date) return "Completed";
  return "Running";
}

export function getRows(): Row[] {
  const daysById: Record<string, DayEntry[]> = {};
  const dates = Object.keys(participation).sort();

  for (const date of dates) {
    for (const [id, activity] of participation[date]) {
      (daysById[id] ??= []).push({ date, activity });
    }
  }

  return participants
    .map((p) => ({
      id: p.id,
      name: p.name,
      count: daysById[p.id]?.length ?? 0,
      days: daysById[p.id] ?? [],
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function formatDate(iso: string, withYear = false) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(withYear ? { year: "numeric" } : {}),
  });
}

export type DayRow = {
  date: string;
  count: number;
  people: { name: string; activity: string }[];
};

function addDays(iso: string, n: number) {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// One row per day from start_date to the last recorded day (days with no entries get count 0)
export function getDailyRows(): DayRow[] {
  const nameById = Object.fromEntries(participants.map((p) => [p.id, p.name]));
  const dates = Object.keys(participation).sort();
  if (dates.length === 0) return [];

  const last = dates[dates.length - 1];
  const rows: DayRow[] = [];
  for (let d = eventDetails.start_date; d <= last; d = addDays(d, 1)) {
    const people = (participation[d] ?? []).map(([id, activity]) => ({
      name: nameById[id] ?? id,
      activity,
    }));
    rows.push({ date: d, count: people.length, people });
  }
  return rows;
}
