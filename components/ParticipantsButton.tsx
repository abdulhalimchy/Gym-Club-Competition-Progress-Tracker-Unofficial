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
      <dd className="flex h-6 items-center gap-2">
        <span className="font-bold">{list.length}</span>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`View the list of ${list.length} participants`}
          title="View participants"
          // the ::after widens the tap area without changing the layout
          className="relative inline-flex h-6 w-6 items-center justify-center rounded-md text-blue-700 transition after:absolute after:-inset-2 after:content-[''] hover:bg-blue-50 active:bg-blue-100"
        >
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
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