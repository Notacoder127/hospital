export type Status = "Upcoming" | "Reminder Sent" | "Completed";

export interface Appointment {
  id: string;
  title: string;
  doctor: string;
  date: string;
  location: string;
  status: Status;
  type?: string;
  documents?: string[];
}

export const patient = {
  name: "Eleanor Whitaker",
  phone: "+1 (415) 555-0142",
  address: "248 Linden Ave, San Francisco, CA",
  emergencyContact: {
    name: "Margaret Whitaker (Daughter)",
    phone: "+1 (415) 555-0188",
  },
};

export const appointments: Appointment[] = [
  {
    id: "1",
    title: "Cardiology check-up",
    doctor: "Dr. Patel",
    date: "2026-06-18T10:30:00",
    location: "Bay Heart Clinic · Room 304",
    status: "Reminder Sent",
    type: "Specialist",
    documents: ["Insurance card", "Previous ECG report", "Medication list"],
  },
  {
    id: "2",
    title: "Blood work & lab tests",
    doctor: "Sutter Lab",
    date: "2026-06-22T08:00:00",
    location: "Sutter Health Lab, Geary St.",
    status: "Upcoming",
    type: "Lab",
    documents: ["Lab order form", "Insurance card"],
  },
  {
    id: "3",
    title: "Annual physical",
    doctor: "Dr. Nguyen",
    date: "2026-07-02T14:00:00",
    location: "Mission Bay Primary Care",
    status: "Upcoming",
    type: "Check-up",
    documents: ["Insurance card", "ID"],
  },
  {
    id: "4",
    title: "Eye exam",
    doctor: "Dr. Lopez",
    date: "2026-05-30T09:15:00",
    location: "Pacific Vision Center",
    status: "Completed",
    type: "Specialist",
    documents: ["Insurance card", "Glasses prescription"],
  },
];

export function formatDate(iso: string) {
  const d = new Date(iso);
  return {
    day: d.toLocaleDateString(undefined, { weekday: "short" }),
    date: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    time: d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }),
    full: d.toLocaleString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }),
  };
}

export const statusStyles: Record<Status, string> = {
  Upcoming: "bg-secondary text-secondary-foreground",
  "Reminder Sent": "bg-[oklch(0.92_0.08_75)] text-[oklch(0.35_0.08_75)]",
  Completed: "bg-[oklch(0.92_0.08_155)] text-[oklch(0.35_0.1_155)]",
};
