import { eventDetails, participants, participation } from "../data/competition";

const errors: string[] = [];
const ids = new Set(participants.map((p) => p.id));
if (ids.size !== participants.length) errors.push("Duplicate participant ids");

const iso = /^\d{4}-\d{2}-\d{2}$/;

for (const [date, entries] of Object.entries(participation)) {
  if (!iso.test(date) || isNaN(Date.parse(date))) {
    errors.push(`Bad date format: ${date}`);
    continue;
  }
  if (date < eventDetails.start_date || date > eventDetails.end_date) {
    errors.push(`${date} is outside the event range`);
  }
  const seen = new Set<string>();
  for (const [id] of entries) {
    if (!ids.has(id)) errors.push(`${date}: unknown participant "${id}"`);
    if (seen.has(id)) errors.push(`${date}: "${id}" listed twice`);
    seen.add(id);
  }
}

if (errors.length) {
  console.error("Data validation failed:\n" + errors.map((e) => " - " + e).join("\n"));
  process.exit(1);
}
console.log("Data OK");