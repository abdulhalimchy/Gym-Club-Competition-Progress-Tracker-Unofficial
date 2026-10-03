import DailyChart from "@/components/DailyChart";
import EventDescription from "@/components/EventDescription";
import ParticipantsButton from "@/components/ParticipantsButton";
import ParticipationChart from "@/components/ParticipationChart";
import { eventDetails } from "@/data/competition";
import { formatDate, getDailyRows, getRows, getStatus } from "@/lib/stats";

// Re-check status (Upcoming/Running/Completed) at least hourly on Vercel
export const revalidate = 3600;

const badge = {
  Upcoming: "bg-amber-100 text-amber-800",
  Running: "bg-green-100 text-green-800",
  Completed: "bg-gray-200 text-gray-700",
};

export default function Home() {
  const status = getStatus();
  const rows = getRows();
  const daily = getDailyRows();
  // optional field in data/competition.ts; the section is hidden when it is missing or empty
  const description = (eventDetails as { description?: string }).description?.trim();

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-4 sm:p-8">
      <div role="note" className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-center">
        <p className="text-sm font-bold text-amber-900">Unofficial Progress Tracker</p>
        <p className="text-xs text-amber-800">This is not official.</p>
      </div>

      <header className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl font-bold sm:text-2xl">{eventDetails.name}</h1>
          <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${badge[status]}`}>{status}</span>
        </div>
        {description && <EventDescription text={description} />}
        <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
          <div>
            <dt className="text-gray-500">Start</dt>
            <dd className="flex h-6 items-center font-medium">{formatDate(eventDetails.start_date, true)}</dd>
          </div>
          <div>
            <dt className="text-gray-500">End</dt>
            <dd className="flex h-6 items-center font-medium">{formatDate(eventDetails.end_date, true)}</dd>
          </div>
          <ParticipantsButton people={rows.map(({ id, name, count }) => ({ id, name, count }))} />
        </dl>
      </header>

      <ParticipationChart rows={rows} />
      <DailyChart rows={daily} />
    </main>
  );
}