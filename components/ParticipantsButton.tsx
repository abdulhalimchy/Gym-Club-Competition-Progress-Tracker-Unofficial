"use client";

import { useState } from "react";
import Sheet from "./Sheet";
import { plural } from "@/lib/format";

type Person = { id: string; name: string; count: number };

export default function ParticipantsButton({ people }: { people?: Person[] }) {
  const [open, setOpen] = useState(false);
  // guard: if the page passes something that isn't a list, show an empty list instead of crashing
  const list: Person[] = Array.isArray(people) ? people : [];
  const sorted = [...list].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div>
      <dt className="text-gray-500">Participants</dt>
      <dd>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`Show the list of ${list.length} participants`}
          className="inline-flex items-center gap-0.5 rounded-md bg-blue-50 px-2 text-sm font-bold text-blue-700 ring-1 ring-blue-200 transition hover:bg-blue-100 active:bg-blue-200"
        >
          {list.length}
          <span aria-hidden="true" className="text-xs leading-none">
            
          </span>
        </button>
      </dd>

      {open && (
        <Sheet title="Participants" subtitle={String(list.length)} onClose={() => setOpen(false)}>
          <ul className="divide-y">
            {sorted.map((p, i) => (
              <li key={p.id} className="flex items-center justify-between py-2 text-sm">
                <span>
                  <span className="mr-2 text-gray-400">{i + 1}.</span>
                  {p.name}
                </span>
                <span className="text-gray-500">{plural(p.count, "day")}</span>
              </li>
            ))}
          </ul>
        </Sheet>
      )}
    </div>
  );
}