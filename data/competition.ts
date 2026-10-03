export type Participant = { id: string; name: string };

export const eventDetails = {
  name: "Gym Club Competition",
  start_date: "2026-10-01",
  end_date: "2026-10-31",
};

export const participants: Participant[] = [
  { id: "p1", name: "Michal Walk" },
  { id: "p2", name: "Anita Sharma" },
  { id: "p3", name: "Ravi Kumar" },
];

// date -> list of [participant_id, activity]
export const participation: Record<string, [string, string][]> = {
  "2026-10-01": [
    ["p1", "Gym"],
    ["p2", "Leg day"],
    ["p3", "Running"],
  ],
  "2026-10-02": [
    ["p1", "Leg day"],
    ["p3", "Running"],
  ],
};