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
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) {
      return {
        day: "",
        dateVal: "",
        monthVal: "",
        time: "",
        full: "",
      };
    }
    return {
      day: d.toLocaleDateString("en-US", { weekday: "short" }),
      dateVal: d.toLocaleDateString("en-US", { day: "numeric" }),
      monthVal: d.toLocaleDateString("en-US", { month: "short" }),
      time: d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      full: d.toLocaleString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
    };
  } catch (error) {
    console.error("Error formatting date:", error);
    return {
      day: "",
      dateVal: "",
      monthVal: "",
      time: "",
      full: "",
    };
  }
}

export const statusStyles: Record<Status, string> = {
  Upcoming: "bg-secondary text-secondary-foreground",
  "Reminder Sent": "bg-[oklch(0.92_0.08_75)] text-[oklch(0.35_0.08_75)]",
  Completed: "bg-[oklch(0.92_0.08_155)] text-[oklch(0.35_0.1_155)]",
};

export function getSavedAppointments(userId: string): Appointment[] {
  if (typeof window === "undefined") return [];
  try {
    const key = `mediremind_appointments_${userId}`;
    const stored = localStorage.getItem(key);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (item: any) =>
          item &&
          typeof item === "object" &&
          typeof item.id === "string" &&
          item.id.trim() !== "",
      );
    }
  } catch (err) {
    console.error("Failed to load appointments from localStorage", err);
  }
  return [];
}

export function saveAppointments(userId: string, list: Appointment[]) {
  if (typeof window === "undefined") return;
  try {
    const key = `mediremind_appointments_${userId}`;
    localStorage.setItem(key, JSON.stringify(list));
  } catch (err) {
    console.error("Failed to save appointments to localStorage", err);
  }
}
