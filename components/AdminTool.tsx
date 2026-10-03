"use client";

import { useEffect, useMemo, useState } from "react";

type Participant = { id: string; name: string };
type Entry = { id: string; name: string; activity: string };

type Props = {
  participants: Participant[];
  participation: Record<string, [string, string][]>;
  start: string;
  end: string;
};

export default function AdminTool({ participants, participation, start, end }: Props) {
  const [date, setDate] = useState("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Participant | null>(null);
  const [activity, setActivity] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [newPeople, setNewPeople] = useState<Participant[]>([]);
  const [error, setError] = useState("");
  const [output, setOutput] = useState<{ people: string; day: string; note: string } | null>(null);

  // today's date in YYYY-MM-DD (set after mount to avoid server/client mismatch)
  useEffect(() => {
    setDate(new Date().toLocaleDateString("en-CA"));
  }, []);

  const allPeople = useMemo(() => [...participants, ...newPeople], [participants, newPeople]);

  // most used activities become quick-tap chips
  const frequentActivities = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const list of Object.values(participation)) {
      for (const [, act] of list) counts[act] = (counts[act] ?? 0) + 1;
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([act]) => act);
  }, [participation]);

  const alreadyOnDate = useMemo(
    () => new Set((participation[date] ?? []).map(([id]) => id)),
    [participation, date]
  );
  const dateExists = date in participation;
  const dateOutOfRange = date !== "" && (date < start || date > end);

  const q = query.trim().toLowerCase();
  const matches = q ? allPeople.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 6) : [];
  const exactExists = allPeople.some((p) => p.name.toLowerCase() === q);
  const showDropdown = q !== "" && !selected;

  function nextId(taken: Set<string>) {
    let n = participants.length + 1; // start at len + 1
    while (taken.has(`p${n}`)) n++; // skip ids that already exist
    return `p${n}`;
  }

  function pick(p: Participant) {
    setSelected(p);
    setQuery(p.name);
    setError("");
  }

  function addNewPerson() {
    const name = query.trim();
    if (!name) return;
    const taken = new Set(allPeople.map((p) => p.id));
    const person = { id: nextId(taken), name };
    setNewPeople([...newPeople, person]);
    setOutput(null);
    pick(person);
  }

  function addEntry() {
    if (!selected) return setError("Pick a person first.");
    const act = activity.trim();
    if (!act) return setError("Enter an activity.");
    if (alreadyOnDate.has(selected.id))
      return setError(`${selected.name} is already recorded on ${date} in the data file.`);
    if (entries.some((e) => e.id === selected.id))
      return setError(`${selected.name} is already in today's list.`);

    setEntries([...entries, { id: selected.id, name: selected.name, activity: act }]);
    setOutput(null);
    setError("");
    setSelected(null);
    setQuery("");
    setActivity("");
  }

  function removeEntry(id: string) {
    setEntries(entries.filter((e) => e.id !== id));
    setOutput(null);
  }

  function removeNewPerson(id: string) {
    setNewPeople(newPeople.filter((p) => p.id !== id));
    setEntries(entries.filter((e) => e.id !== id));
    if (selected?.id === id) {
      setSelected(null);
      setQuery("");
    }
    setOutput(null);
  }

  function generate() {
    if (!date) return setError("Pick a date.");
    if (entries.length === 0 && newPeople.length === 0) return setError("Nothing to generate yet.");

    const people = newPeople
      .map((p) => `  { id: ${JSON.stringify(p.id)}, name: ${JSON.stringify(p.name)} },`)
      .join("\n");

    const lines = entries.map((e) => `[${JSON.stringify(e.id)}, ${JSON.stringify(e.activity)}],`);
    let day = "";
    let note = "";
    if (lines.length > 0) {
      if (dateExists) {
        day = lines.map((l) => `    ${l}`).join("\n");
        note = `${date} already exists in the data file. Paste these lines inside that existing block.`;
      } else {
        day = `  "${date}": [\n${lines.map((l) => `    ${l}`).join("\n")}\n  ],`;
      }
    }
    setError("");
    setOutput({ people, day, note });
  }

  return (
    <main className="mx-auto max-w-2xl space-y-5 p-4 sm:p-8">
      <h1 className="text-xl font-bold">Admin helper</h1>
      <p className="text-sm text-gray-500">Builds the text to paste into data/competition.ts. Nothing is saved here.</p>

      {/* Date */}
      <section className="space-y-1">
        <label className="text-sm font-medium">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            setOutput(null);
          }}
          className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2"
        />
        {dateOutOfRange && (
          <p className="text-sm text-red-600">This date is outside the event range ({start} to {end}). The build would fail.</p>
        )}
        {dateExists && (
          <p className="text-sm text-amber-700">
            Already recorded on this date: {[...alreadyOnDate].map((id) => allPeople.find((p) => p.id === id)?.name ?? id).join(", ")}
          </p>
        )}
      </section>

      {/* Search + activity */}
      <section className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
        <div className="relative">
          <label className="text-sm font-medium">Person</label>
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelected(null);
            }}
            placeholder="Search name..."
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
          {showDropdown && (
            <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-md border border-gray-200 bg-white shadow">
              {matches.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => pick(p)}
                    className="flex w-full justify-between px-3 py-2 text-left text-sm hover:bg-gray-100"
                  >
                    <span>{p.name}</span>
                    <span className="text-gray-400">{p.id}</span>
                  </button>
                </li>
              ))}
              {!exactExists && (
                <li>
                  <button
                    type="button"
                    onClick={addNewPerson}
                    className="w-full px-3 py-2 text-left text-sm font-medium text-blue-700 hover:bg-blue-50"
                  >
                    + Add new person “{query.trim()}”
                  </button>
                </li>
              )}
            </ul>
          )}
        </div>

        <div>
          <label className="text-sm font-medium">Activity</label>
          <input
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
            placeholder="e.g. Leg day"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
          {frequentActivities.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {frequentActivities.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setActivity(a)}
                  className="rounded-full border border-gray-300 px-3 py-1 text-xs hover:bg-gray-100"
                >
                  {a}
                </button>
              ))}
            </div>
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="button" onClick={addEntry} className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white">
          Add
        </button>
      </section>

      {/* New participants */}
      {newPeople.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-semibold">New participants ({newPeople.length})</h2>
          <ul className="divide-y rounded-xl border border-gray-200 bg-white">
            {newPeople.map((p) => (
              <li key={p.id} className="flex items-center justify-between px-4 py-2 text-sm">
                <span>
                  <span className="mr-2 font-mono text-gray-500">{p.id}</span>
                  {p.name}
                </span>
                <button onClick={() => removeNewPerson(p.id)} className="text-gray-400 hover:text-red-600" aria-label="Remove">
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Today's list */}
      <section className="space-y-2">
        <h2 className="font-semibold">
          List for {date || "..."} ({entries.length})
        </h2>
        {entries.length === 0 ? (
          <p className="text-sm text-gray-500">No entries yet.</p>
        ) : (
          <ul className="divide-y rounded-xl border border-gray-200 bg-white">
            {entries.map((e) => (
              <li key={e.id} className="flex items-center justify-between px-4 py-2 text-sm">
                <span>
                  <span className="font-medium">{e.name}</span>
                  <span className="text-gray-500"> · {e.activity}</span>
                </span>
                <button onClick={() => removeEntry(e.id)} className="text-gray-400 hover:text-red-600" aria-label="Remove">
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <button type="button" onClick={generate} className="w-full rounded-md bg-gray-900 px-4 py-3 font-medium text-white">
        Generate
      </button>

      {/* Output */}
      {output && (
        <section className="space-y-4">
          {output.people && (
            <OutputBlock
              title="1. Paste inside participants (end of the list)"
              text={output.people}
            />
          )}
          {output.day && (
            <OutputBlock
              title={`${output.people ? "2" : "1"}. Paste inside participation (at the bottom)`}
              text={output.day}
              note={output.note}
            />
          )}
        </section>
      )}
    </main>
  );
}

function OutputBlock({ title, text, note }: { title: string; text: string; note?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked: user can select the text manually */
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        <button onClick={copy} className="rounded-md border border-gray-300 px-3 py-1 text-xs">
          {copied ? "Copied ✓" : "Copy"}
        </button>
      </div>
      {note && <p className="text-xs text-amber-700">{note}</p>}
      <pre className="overflow-x-auto rounded-lg bg-gray-900 p-3 text-xs text-gray-100">{text}</pre>
    </div>
  );
}