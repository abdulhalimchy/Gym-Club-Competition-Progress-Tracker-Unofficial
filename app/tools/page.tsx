import DailyChart from "@/components/DailyChart";
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

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-4 sm:p-8">
      <header className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-xl font-bold sm:text-2xl">{eventDetails.name}</h1>
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${badge[status]}`}>{status}</span>
        </div>
        <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
          <div>
            <dt className="text-gray-500">Start</dt>
            <dd className="font-medium">{formatDate(eventDetails.start_date, true)}</dd>
          </div>
          <div>
            <dt className="text-gray-500">End</dt>
            <dd className="font-medium">{formatDate(eventDetails.end_date, true)}</dd>
          </div>
          <ParticipantsButton people={rows.map(({ id, name, count }) => ({ id, name, count }))} />
        </dl>
      </header>

      <ParticipationChart rows={rows} />
      <DailyChart rows={daily} />
    </main>
  );
}