import type { Metadata } from "next";
import AdminTool from "@/components/AdminTool";
import { eventDetails, participants, participation } from "@/data/competition";

export const metadata: Metadata = {
  title: "Admin helper",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <AdminTool
      participants={participants}
      participation={participation}
      start={eventDetails.start_date}
      end={eventDetails.end_date}
    />
  );
}