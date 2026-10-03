# Gym Club Competition Tracker (Unofficial)

A simple Next.js (App Router) web app that tracks participation in a gym club competition. There is no database. All data lives in one file (`data/competition.ts`), and every update is a git commit that Vercel redeploys automatically.

## Features

- **Event header:** event name, start date, end date, status (Upcoming / Running / Completed) and participants count.
- **Participation chart:** horizontal bar chart of days attended per person, with the count on each bar.
  - Dropdown for Top 5 / Top 10 / Top 20 (default) / All.
  - Tap a bar to see that person's day-by-day activity (e.g. `Oct 1: Gym`, `Oct 2: Leg day`).
- **Mobile responsive:** works on phone and desktop. The detail panel is a bottom sheet on mobile.
- **Admin helper (`/admin`):** builds the text to paste into the data file, so you never match ids and names by hand.
- **Build-time validation:** a bad data file fails the build, so a typo never reaches the live site.

## Tech stack

- Next.js (App Router, TypeScript)
- Tailwind CSS
- Recharts
- tsx (runs the validation script)
- Hosting: Vercel (free tier)

## Project structure

```
app/
  page.tsx                  # main page: header + chart
  tools/page.tsx            # admin helper tools page (noindex)
components/
  ParticipationChart.tsx    # bar chart, Top-N dropdown, detail panel
  AdminTool.tsx             # admin helper UI
data/
  competition.ts            # THE data file: event, participants, participation
lib/
  stats.ts                  # status + per-person counts and day lists
scripts/
  validate.ts               # data validation, runs before every build
```

## Data format (`data/competition.ts`)

```ts
export const eventDetails = {
  name: "Gym Club Competition",
  start_date: "2026-10-01", // YYYY-MM-DD
  end_date: "2026-10-31",
};

export const participants = [
  { id: "p1", name: "Michal Walk" },
  { id: "p2", name: "Anita Sharma" },
];

// date -> list of [participant_id, activity]
export const participation: Record<string, [string, string][]> = {
  "2026-10-01": [
    ["p1", "Gym"],
    ["p2", "Leg day"],
  ],
  "2026-10-02": [["p1", "Leg day"]],
};
```

### Rules

- Dates use ISO format `YYYY-MM-DD`.
- Each person appears **once per date**. Attendance counts once per day.
- Participant ids are stable (`p1`, `p2`, ...). Never reuse an id for a different person.
- Status is **not stored**. It is calculated from the dates:
  - today before `start_date` → **Upcoming**
  - between `start_date` and `end_date` → **Running**
  - after `end_date` → **Completed**
- The status is calculated in the `Europe/Helsinki` timezone (`TIMEZONE` in `lib/stats.ts`). Change it if the competition runs in another timezone.
- The Participants count shows everyone registered in `participants`.

## Getting started

Requires Node.js 20.9 or newer.

```bash
npm install
npm run validate   # should print "Data OK"
npm run dev        # http://localhost:3000
```

To test on a phone on the same Wi-Fi, open `http://<your-mac-ip>:3000`. Find the IP with `ipconfig getifaddr en0`.

## Daily routine

1. Open `http://localhost:3000/tools` (or the deployed `/tools`).
2. Pick the date (defaults to today).
3. Search for a person, choose them, enter the activity (or tap a chip) and press **Add**. Repeat for everyone.
4. If a person does not exist yet, choose **+ Add new person**. They get the next free id automatically (starting at `participants.length + 1`).
5. Press **Generate**, then copy the output blocks:
   - **New participants** go at the end of the `participants` array.
   - **Date block** goes at the bottom of `participation`. If the date already exists, paste the lines inside the existing block.
6. Add new participants first, then the date block.
7. Check and publish:
   ```bash
   npm run validate
   git add data/competition.ts
   git commit -m "Add attendance 2026-10-03"
   git push
   ```
8. Vercel redeploys in about a minute.

The admin tools page only generates text. It does not save anything. It warns you if a person is already recorded on that date or if the date is outside the event range.

## Validation

`npm run validate` runs automatically before `npm run build` (via `prebuild`), so Vercel refuses to deploy bad data. It fails when:

- a participant id is duplicated
- a date is not in `YYYY-MM-DD` format
- a date is outside `start_date` to `end_date`
- an attendance entry uses an unknown participant id
- the same participant appears twice on one date

If a Vercel deploy fails, open the failed deployment and read the log. It lists the exact line to fix.

## Deployment (Vercel)

1. Push the repo to GitHub.
2. On vercel.com choose **Add New → Project** and import the repo.
3. Keep the defaults (Framework: Next.js) and click **Deploy**.

Every push to `main` triggers a new deploy. The main page uses `revalidate = 3600`, so the status badge also refreshes at least hourly.